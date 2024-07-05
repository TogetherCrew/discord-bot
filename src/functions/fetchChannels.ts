import { type TextChannel, type VoiceChannel } from 'discord.js';
import { type Connection, type HydratedDocument } from 'mongoose';
import { type IPlatform, type IChannel } from '@togethercrew.dev/db';
import { channelService, platformService } from '../database/services';
import { coreService } from '../services';
import parentLogger from '../config/logger';

const logger = parentLogger.child({ module: 'FetchChannels' });

/**
 * Fetches and saves text and voice channel information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Snowflake} guildId - The identifier of the guild to extract text and voice channels from.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function fetchGuildChannels(connection: Connection, platform: HydratedDocument<IPlatform>) {
  try {
    const client = await coreService.DiscordBotManager.getClient();
    const hasBotAccessToGuild = await platformService.checkBotAccessToGuild(platform.metadata?.id);
    if (!hasBotAccessToGuild) {
      return;
    }
    const guild = await client.guilds.fetch(platform.metadata?.id);
    let channelsToStore: IChannel[] = [];
    logger.info({ guild_id: platform.metadata?.id }, 'Fetching channels');

    // const textAndVoiceChannels = [...guild.channels.cache.values()].filter(
    //   (channel) => channel.type === 0 || channel.type === 2 || channel.type === 4,
    // ) as Array<TextChannel | VoiceChannel>;

    const fetchedChannels = await guild.channels.fetch();
    const filterNeededChannels = [...fetchedChannels.values()].filter(
      (channel) => channel?.type === 0 || channel?.type === 2 || channel?.type === 4,
    ) as Array<TextChannel | VoiceChannel>;
    channelsToStore = filterNeededChannels.map(channelService.getNeededDateFromChannel);
    await channelService.createChannels(connection, channelsToStore);
    logger.info({ guild_id: platform.metadata?.id }, 'Channels stored successfully');
  } catch (error) {
    logger.error({ guild_id: platform.metadata?.id, error }, 'Failed to fetch channels');
  }
}
