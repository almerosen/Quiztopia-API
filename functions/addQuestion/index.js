import { db } from "../../services/db.js"
import { verifyToken } from "../../middleware/verifyToken.js"
import { sendError, sendResponse } from "../../utils/responses.js"
import middy from "@middy/core";


const addQuestion = async (event) => {
    console.log(event)

    try {
        const { userId } = event.user
        const { quizId } = event.pathParameters

        if (!quizId) return sendError(404, { message: "QuizId is missing" })

        const { newQuestion } = JSON.parse(event.body)

        if(!newQuestion || newQuestion.length === 0 || !Array.isArray(newQuestion)) {
            return sendError(400, { message: "Question needs to be in correct format" })
        }

        // Check if the quiz exists and if the logged in user created it
        const quizExists = await db.get({
            TableName: "Quiztopia-QuizzesTable",
            Key: { quizId, userId}
        })
        console.log("quizExists:", quizExists.Item)

        if(!quizExists.Item) {
            return sendError(404, { message: "Quiz does not exist or you can not modify someone else's quiz" })
        }

        const updateQuestions = await db.update({
            TableName: "Quiztopia-QuizzesTable",
            Key: { quizId, userId },
            UpdateExpression: "SET #q = list_append(questions, :newQuestion)",
            ExpressionAttributeNames: { "#q": "questions"}, // not a reserved name but wanted to test this method
            ExpressionAttributeValues: {
                ":newQuestion": newQuestion
            },
            ReturnValues: "ALL_NEW"
        })

        console.log("updatedQuestions:", updateQuestions.Attributes)

        return sendResponse(200, { message: "Successfully added question", updatedQuestions: updateQuestions.Attributes})

    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to add question", error: error.message })
    }
}

export const handler = middy()
    .handler(addQuestion)
    .use(verifyToken)