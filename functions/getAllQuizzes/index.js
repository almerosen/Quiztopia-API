import { db } from "../../services/db.js";
import { sendResponse, sendError } from "../../utils/responses.js";

export const handler = async (event) => {
    console.log(event)

    try {
        const { Items } = await db.scan({
            TableName: "Quiztopia-QuizzesTable",
            IndexName: "createdAtIndex",
            ScanIndexForward: false // quizzes in descending ordner by createdAt date
            // ProjectionExpression: "quizName, createdBy" // only retrieve name of the quiz and who created it
        })

        return sendResponse(200, { message: "Successfully retrieved quizzes", quizzes: Items})

    }catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to get quizzes" })
    }
}