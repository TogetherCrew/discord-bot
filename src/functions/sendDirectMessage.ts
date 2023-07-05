import { Client, Snowflake } from "discord.js";

/**
 * 
 * @param client 
 * @param info 
 * @returns throw error if User has DMs closed or has no mutual servers with the bot
 */
export default async function sendDirectMessage(client: Client, info: { discordId: Snowflake, message: string }) {
    const { discordId, message } = info

    // Fetch the user object
    const user = await client.users.fetch(discordId)

    // Send a private message
    const sendResponse = await user.send(message);

    return sendResponse
}
