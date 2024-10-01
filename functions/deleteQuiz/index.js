import { db } from "../../services/db.js";
import { sendResponse, sendError } from "../../utils/responses.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import middy from "@middy/core";

const deleteQuiz = async (event) => {
    console.log(event)

    try {
        const { userId } = event.user
        const { quizId } = event.pathParameters 

        if (!quizId) return sendError(404, { message: "QuizId is missing" })

        // Check if quiz exists and that it belongs to logged in user
        const quizzExist = await db.get({
            TableName: "Quiztopia-QuizzesTable",
            Key: { userId, quizId }
        })

        if (!quizzExist.Item) return sendError(400, { message: "Quiz does not exist or you can not delete someone else's quiz" })

        const deletedQuiz = await db.delete({
            TableName: "Quiztopia-QuizzesTable",
            Key: { userId, quizId },
            ReturnValues: "ALL_OLD"
        })

        return sendResponse(200, { message: "Successfully deleted quiz", deletedQuiz: deletedQuiz.Attributes})

    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to delete quiz" , error: error.message})
    }
}

export const handler = middy().handler(deleteQuiz).use(verifyToken)

