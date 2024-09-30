import { db } from "../../services/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { sendResponse, sendError } from "../../utils/responses.js";

export const handler = async (event) => {
    console.log(event)

    try {
        const { email, password } = JSON.parse(event.body)

        if (!email || !password) return sendError(400, { message: "Please provide both email and password" })

        // Check if email (account) already exists:
        const {Items} = await db.query({
            TableName: "Quiztopia-UsersTable",
            IndexName: "emailIndex",
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": email
            }
           
        })
        console.log("Items:", Items, "Items length:", Items.length) // returns an array. Undefined if the email do not exist.

        if (Items && Items.length > 0) {
            return sendError(404, { message: "Email already exists" })
        }

        // Hash password
        const hashedPassowrd = await bcrypt.hash(password, 10)

        const user = {
            userId: uuidv4(),
            email: email,
            hashedPassowrd,
            createdAt: new Date().toISOString()
        }

        await db.put({
            TableName: "Quiztopia-UsersTable",
            Item: user
        })

        return sendResponse(200, { message: "Successfully created user account", user: user.userId })

    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to create account", error: error.message })
    }
}