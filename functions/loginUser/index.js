import { db } from "../../services/db.js"
import { getUser } from "../../utils/getUser.js"
import { sendResponse, sendError } from "../../utils/responses.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'

const passwordCheck = async (password, user) => {
    const correctPassword = await bcrypt.compare(password, user.hashedPassword)

    return correctPassword
}

const generateToken = (user) => {
    const token = jwt.sign({ userId: user.userId, username: user.username }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })

    return token
}

export const handler = async (event) => {
    console.log(event)

    try {
        const { username, password } = JSON.parse(event.body)

        if (!username || !password) {
            return sendError(400, { message: "Please provide both username and password" })
        }

        // Fetch user details
        const user = await getUser(username)

        if (!user) {
            return sendError(404, { message: "User account (username) does not exist" })
        }

        // Check if password is correct
        const correctPassword = await passwordCheck(password, user)

        if (!correctPassword) return sendError(400, { message: "Invalid password or username" })

        // Generate token
        const token = generateToken(user)

        return sendResponse(200, { message: "Successfully logged in", user: user.username, token: token})

    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to login", error: error.message })
    }
}