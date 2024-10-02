import { db } from "../../services/db.js";
import { sendResponse, sendError } from "../../utils/responses.js";

export const handler = async (event) => {
    console.log(event)

    try {
        const { Items } = await db.scan({
            TableName: "Quiztopia-QuizzesTable",
            // ProjectionExpression: "quizName, createdBy" // only retreive name of the quiz and who created it
        })

        return sendResponse(200, { message: "Successfully retrived quizzes", quizzes: Items})

    }catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to get quzzes" })
    }
}