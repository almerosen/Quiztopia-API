import { db } from "../../services/db.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { sendResponse, sendError } from "../../utils/responses.js";
import { v4 as uuidv4 } from 'uuid';
import middy from "@middy/core";


const createQuiz = async (event) => {
    console.log(event)

    try {

        const { userId, email } = event.user

        const { title, questions } = JSON.parse(event.body)
    
        // Check if title is provided, that questions is passed in as an array, and that the array is not empty
        if (!title || !Array.isArray(questions) || questions.length === 0) {
            return sendError(400, { message: "Title and questions are required" })
        }
    
        // Create quiz
        const quiz = {
            quizId: uuidv4(),
            title,
            questions,
            createdBy: userId,
            createdByUser: email,
            createdAt: new Date().toISOString()
        }
    
        await db.put({
            TableName: "Quiztopia-QuizzesTable",
            Item: quiz
        })

        return sendResponse(200, { message: "successfully created quiz", quiz})

    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to create quiz", error: error.message})
    }
}

export const handler = middy()
    .handler(createQuiz)
    .use(verifyToken)