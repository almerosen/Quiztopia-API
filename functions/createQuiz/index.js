import { db } from "../../services/db.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { sendResponse, sendError } from "../../utils/responses.js";
import { v4 as uuidv4 } from 'uuid';
import middy from "@middy/core";


const createQuiz = async (event) => {
    console.log(event)

    try {

        // Get these from the decoded token in the verifyToken middleware
        const { userId, email } = event.user

        const { quizName, questions } = JSON.parse(event.body)
    
        // Check if title is provided, that questions is passed in as an array, and that the array is not empty
        if (!quizName || !Array.isArray(questions) || questions.length === 0) {
            return sendError(400, { message: "Title and questions are required" })
        }
    
        // Create quiz
        const quiz = {
            quizId: uuidv4(),
            quizName,
            questions,
            userId: userId,
            createdBy: email,
            createdAt: new Date().toISOString()
        }
    
        await db.put({
            TableName: "Quiztopia-QuizzesTable",
            Item: quiz
        })

        return sendResponse(200, { message: "successfully created quiz", quizId: quiz.quizId})

    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to create quiz", error: error.message})
    }
}

export const handler = middy()
    .handler(createQuiz)
    .use(verifyToken)