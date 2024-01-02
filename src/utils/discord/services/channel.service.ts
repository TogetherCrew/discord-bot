import { Snowflake } from 'discord.js';
import { DiscordBotManager } from '../core';

/**
 * send message to channel
 * @param {Snowflake} discordId - channel discordId.
 * @param {string[]} message - message string.
 */
async function sendChannelMessage(discordId: Snowflake, message: string) {
    const client = await DiscordBotManager.getClient();
    const channel = await client.channels.fetch(discordId);
    if (channel && channel.isTextBased()) {
        return await channel.send(message);
    }
}

export {
    sendChannelMessage
}