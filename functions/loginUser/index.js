import { db } from "../../services/db.js"
import { getUser } from "../../utils/getUser.js"
import { sendResponse, sendError } from "../../utils/responses.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'



export const handler = async (event) => {
    console.log(event)

    try {
        const { email, password } = JSON.parse(event.body)

        if (!email || !password) {
            return sendError(404, { "Please fill in both email and password" })
        }

        const user = await getUser(email)

        if (!user) {
            return sendError(400, { message: "User account (email) does not exist" })
        }

        // Check if password is correct
        const correctPassword = bcrypt.compare(password, user.hashedPassword)

        if (!correctPassword) return sendError(400, { message: "Invalid password or email" })

        // Generate token
        const token = jwt.sign({ userId: user.userId, email: user.email}, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })

    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to login" })
    }
}