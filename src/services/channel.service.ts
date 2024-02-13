import { Snowflake } from 'discord.js';
import coreService from './core.service';

/**
 * send message to channel
 * @param {Snowflake} discordId - channel discordId.
 * @param {string[]} message - message string.
 */
async function sendChannelMessage(discordId: Snowflake, message: string) {
    const client = await coreService.DiscordBotManager.getClient();
    const channel = await client.channels.fetch(discordId);
    if (channel && channel.isTextBased()) {
        return await channel.send(message);
    }
}

export default {
    sendChannelMessage
}