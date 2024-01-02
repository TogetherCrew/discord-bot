import { Snowflake } from 'discord.js';
import { DiscordBotManager } from '../core';

/**
 * send direct message to user
 * @param {Snowflake} discordId - user discordId.
 * @param {string[]} message - message string.
 * @returns 
 */
async function sendDirectMessage(discordId: Snowflake, message: string) {
    const client = await DiscordBotManager.getClient();
    const user = await client.users.fetch(discordId);
    if (user) {
        return await user.send(message);
    }
}

export {
    sendDirectMessage
}