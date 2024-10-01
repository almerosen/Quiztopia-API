import { sendError, sendResponse } from "../../utils/responses.js"
import { db } from "../../services/db.js"

export const handler = async (event) => {
    console.log(event)

    try {
        const { userId, quizId } = event.pathParameters

        const { Item } = await db.get({
            TableName: "Quiztopia-QuizzesTable",
            Key: { 
                userId: userId,
                quizId: quizId
            }
            
        })
        console.log("Item:", Item)

        if (!Item) {
            return sendError(400, { message: `Quiz with Id ${quizId} not found for user ${userId}` })
        }

        return sendResponse(200, { message: "Successfully retreived quiz" , quiz: Item})

    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to get quiz" , error: error.message})
    }

}