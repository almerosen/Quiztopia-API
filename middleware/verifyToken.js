import jwt from "jsonwebtoken"
import { sendError } from "../utils/responses.js"

export const verifyToken = {
    before: async (request) => {
        try {
            const authHeader = request.event.headers.authorization

            if (!authHeader) {
                return sendError(404, { message: "No token provided" })
            }

            const token = authHeader.replace("Bearer ", "")

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)

            request.event.user = decodedToken

            return request.response

        } catch (error) {
            console.error("Error:", error)
            return sendError(400, { message: "Invalid or expired token" })
        }

    }
}