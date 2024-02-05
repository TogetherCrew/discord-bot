import { type Channel, ChannelType, type Snowflake, type TextChannel, type Message } from 'discord.js';
import {} from 'discord.js';
import { createPrivateThreadAndSendMessage } from '../functions/thread';
import { addDirectMessage } from '../queue/queues/directMessage';
import coreService from './core.service';

/**
 * Send direct message to user.
 * @param {Snowflake} discordId - user discordId.
 * @param {string} message - message string.
 * @returns {Promise<Message | undefined>} A promise that resolves with the sent message or undefined.
 */
async function sendDirectMessage(discordId: Snowflake, message: string): Promise<Message | undefined> {
  const client = await coreService.DiscordBotManager.getClient();
  const user = await client.users.fetch(discordId);
  if (user !== null && user !== undefined) {
    return await user.send(message);
  }
}

async function notifyUserAboutAnalysisFinish(
  discordId: string,
  info: { guildId: Snowflake; message: string; useFallback: boolean }
): Promise<void> {
  const client = await coreService.DiscordBotManager.getClient();
  const { guildId, message, useFallback } = info;
  const guild = await client.guilds.fetch(guildId);
  const channels = await guild.channels.fetch();
  const arrayChannels = Array.from(channels, ([name, value]) => ({ ...value })) as Channel[];
  const textChannels = arrayChannels.filter((channel) => channel.type === ChannelType.GuildText) as TextChannel[];
  const rawPositionBasedSortedTextChannels = textChannels.sort((a, b) => a.rawPosition - b.rawPosition);
  const upperTextChannel = rawPositionBasedSortedTextChannels[0];

  try {
    addDirectMessage(discordId, message);
  } catch (error) {
    if (useFallback) {
      await createPrivateThreadAndSendMessage(upperTextChannel, {
        threadName: 'TogetherCrew Status',
        message: `<@${discordId}> ${message}`,
      });
    }
  }
}

export default {
  sendDirectMessage,
  notifyUserAboutAnalysisFinish,
};
