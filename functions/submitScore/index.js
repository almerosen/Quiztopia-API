import { db } from "../../services/db.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { sendResponse, sendError } from "../../utils/responses.js";
import middy from "@middy/core";

const submitScore = async (event) => {
    console.log(event)

    try {
        const { userId } = event.user
        const { quizId } = event.pathParameters
        const { score } = JSON.parse(event.body)

        if (!score || (score < 0) || (score > 5)) return sendError(400, { message: "Score is required and it must be between 0 - 5" })
        
        await db.put({
            TableName: "Quiztopia-LeaderboardTable",
            Item: {
                quizId,
                userId,
                score
            }
        })

        return sendResponse(200, { message: "Successfully registered score" })

    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to register score", error: error.message })
    }
}

export const handler = middy().handler(submitScore).use(verifyToken)
