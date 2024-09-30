import { db } from "../../services/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { sendResponse, sendError } from "../../utils/responses.js";
import { getUser } from "../../utils/getUser.js";

export const handler = async (event) => {
    console.log(event)

    try {
        const { email, password } = JSON.parse(event.body)

        if (!email || !password) return sendError(400, { message: "Please provide both email and password" })

        const userExists = await getUser(email)

        if (userExists) return sendError(404, { message: "Email (account) already exists" })

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = {
            userId: uuidv4(),
            email: email,
            hashedPassword,
            createdAt: new Date().toISOString()
        }

        await db.put({
            TableName: "Quiztopia-UsersTable",
            Item: user
        })

        return sendResponse(200, { message: "Successfully created user account", userId: user.userId })

    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to create account", error: error.message })
    }
}