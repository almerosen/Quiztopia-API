import { db } from "../../services/db.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { sendResponse, sendError } from "../../utils/responses.js";
import middy from "@middy/core";

const submitScore = async (event) => {
    console.log(event)

    try {
        const { userId, username } = event.user
        const { quizId } = event.pathParameters
        const { score } = JSON.parse(event.body)

        if (!score || (score < 0) || (score > 5)) return sendError(400, { message: "Please provide a score between 0 - 5" })

        // Retrieve quiz details - to prevent user from submitting score on their own quiz  
        const { Item } = await db.get({
            TableName: "Quiztopia-QuizzesTable",
            Key: { userId, quizId }
        })
        const quiz = Item

        if (quiz && quiz.userId === userId) {
            return sendResponse(403, { message: "You cannot submit a score on a quiz you created" })   
        }

        // Check if the user already have submitted a score on the quiz
        const scoreExists = await db.get({
            TableName: "Quiztopia-Leaderboard-Table",
            Key: { quizId, userId }
        })
        console.log("scoreExist:", scoreExists.Item)
        if (scoreExists.Item) {
            return sendError(400, { message: "You have already submitted a score on this quiz" })
        }

        // Submit score if the user did not create the quiz
        await db.put({
            TableName: "Quiztopia-Leaderboard-Table",
            Item: {
                quizId,
                userId,
                username,
                score
            }
        })

        return sendResponse(200, { message: "Score submitted" })

    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to submit score", error: error.message })
    }
}

export const handler = middy().handler(submitScore).use(verifyToken)
