import { type Snowflake, type Message } from 'discord.js';
import coreService from './core.service';

/**
 * Send message to channel
 * @param {Snowflake} discordId - channel discordId.
 * @param {string} message - message string.
 * @returns {Promise<Message | undefined>} - The sent message or undefined if unable to send.
 */
async function sendChannelMessage(discordId: Snowflake, message: string): Promise<Message | undefined> {
  const client = await coreService.DiscordBotManager.getClient();
  const channel = await client.channels.fetch(discordId);
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-optional-chain
  if (channel && channel.isTextBased()) {
    return await channel.send(message);
  }
}

export default {
  sendChannelMessage,
};
