import { Client, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { Connection, HydratedDocument } from 'mongoose';
import { IPlatform, IChannel } from '@togethercrew.dev/db';
import { channelService, platformService } from '../database/services';
import parentLogger from '../config/logger';
console.log('FLAG')

const logger = parentLogger.child({ module: 'FetchChannels' });

/**
 * Iterates over a list of channels and pushes extracted data from each channel to an array.
 * @param {IChannel[]} arr - The array to which extracted data will be pushed.
 * @param {Array<TextChannel | VoiceChannel | CategoryChannel>} channelArray - An array of channels from which data is to be extracted.
 * @returns {IChannel[]} - The updated array containing the extracted data.
 */
function pushChannelsToArray(
  arr: IChannel[],
  channelArray: Array<TextChannel | VoiceChannel | CategoryChannel>
): IChannel[] {
  for (const channel of channelArray) {
    arr.push(channelService.getNeededDateFromChannel(channel));
  }
  return arr;
}

/**
 * Fetches and saves text and voice channel information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Client} client - The discord.js client object used to fetch the guild.
 * @param {Snowflake} guildId - The identifier of the guild to extract text and voice channels from.
 */
export default async function fetchGuildChannels(connection: Connection, client: Client, platform: HydratedDocument<IPlatform>) {
  try {
    const hasBotAccessToGuild = await platformService.checkBotAccessToGuild(client, platform.metadata?.id);
    if (!hasBotAccessToGuild) {
      return;
    }
    const guild = await client.guilds.fetch(platform.metadata?.id);
    const channelsToStore: IChannel[] = [];
    const textAndVoiceChannels = [...guild.channels.cache.values()].filter(
      channel => channel.type === 0 || channel.type === 2 || channel.type === 4
    ) as Array<TextChannel | VoiceChannel>;
    pushChannelsToArray(channelsToStore, textAndVoiceChannels);
    await channelService.createChannels(connection, channelsToStore); // assuming a 'channelService'
  } catch (error) {
    logger.error({ guild_id: platform.metadata?.id, error }, 'Failed to fetch channels');
  }
}
