import { Snowflake } from 'discord.js';
import { DiscordBotManager } from '../utils/discord';

/**
 *
 * @param info
 * @returns throw error if User has DMs closed or has no mutual servers with the bot
 */
export default async function sendDirectMessage(info: { discordId: Snowflake; message: string }) {
  const client = await DiscordBotManager.getClient();

  const { discordId, message } = info;

  // Fetch the user object
  const user = await client.users.fetch(discordId);

  // Send a private message
  const sendResponse = await user.send(message);

  return sendResponse;
}
