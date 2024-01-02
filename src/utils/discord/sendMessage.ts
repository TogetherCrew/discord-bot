import { Snowflake } from 'discord.js';
import { DiscordBotManager } from './core';

/**
 * send direct message to user
 * @param {Snowflake} discordId - user discordId.
 * @param {string[]} message - message string.
 * @returns 
 */
export async function sendDirectMessage(discordId: Snowflake, message: string) {
    const client = await DiscordBotManager.getClient();
    const user = await client.users.fetch(discordId);
    if (user) {
        return await user.send(message);
    }
}

/**
 * send message to channel
 * @param {Snowflake} discordId - channel discordId.
 * @param {string[]} message - message string.
 */
export async function sendChannelMessage(discordId: Snowflake, message: string) {
    const client = await DiscordBotManager.getClient();
    const channel = await client.channels.fetch(discordId);
    if (channel && channel.isTextBased()) {
        return await channel.send(message);
    }
}
