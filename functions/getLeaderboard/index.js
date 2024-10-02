import { db } from "../../services/db.js";
import { sendResponse, sendError } from "../../utils/responses.js";

export const handler = async (event) => {
    console.log(event)

    try {
        const { quizId } = event.pathParameters

        const { Items } = await db.query({
            TableName: "Quiztopia-Leaderboard-Table",
            IndexName: "quizIdScoreIndex",
            KeyConditionExpression: "quizId = :quizId",
            ExpressionAttributeValues: {
                ":quizId": quizId
            },
            ProjectionExpression: "username, score",
            ScanIndexForward: false, // descending order
            Limit: 3 // Get top 3 scores
        })
        console.log("result:", Items)

        // To retrieve the quizName
        const quizData = await db.query({
            TableName: "Quiztopia-QuizzesTable",
            IndexName: "quizIndex",
            KeyConditionExpression: "quizId = :quizId",
            ExpressionAttributeValues: {
                ":quizId": quizId
            }
            
        })

        if (!quizData.Items || quizData.Items === 0) {
            return sendError(404, { message: "Quiz not found" })
        }

        const quizName = quizData.Items[0].quizName

        const topScores = Items

        // const formattedScores = topScores.map(item => ({
        //     username: item.username,
        //     score: item.score
        // }))

        return sendResponse(200, { message: "Successfully retreived leaderboard", quizName, topScores })


    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to get leaderboard", error: error.message })
    }
}