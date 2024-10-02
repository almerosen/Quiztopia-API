import { db } from "../services/db.js";

export const getUser = async (username) => {
    try {
        const {Items} = await db.query({
            TableName: "Quiztopia-Users",
            IndexName: "usernameIndex",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username.toLowerCase()
            }
        })
        console.log("Items:", Items, "Items length:", Items.length)

        // check if user exists
        if (Items && Items.length > 0) {
            return Items[0] // returns an array with one user if it exists
        }

        return null // if no user exists. Items undefined

    } catch (error) {
        console.error("Error:", error)
        throw new Error("Error fetching user")
    }
}