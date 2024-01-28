import { Connection, HydratedDocument } from 'mongoose';
import { IPlatform } from '@togethercrew.dev/db';
import { platformService } from '../database/services';
import handleFetchChannelMessages from './fetchMessages';
import parentLogger from '../config/logger';
import { coreService } from '../services';

const logger = parentLogger.child({ module: 'GuildExtraction' });
/**
 * Extracts information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Snowflake} guildId - The identifier of the guild to extract information from.
 */
export default async function guildExtraction(connection: Connection, platform: HydratedDocument<IPlatform>) {
  const client = await coreService.DiscordBotManager.getClient();

  logger.info({ guild_id: platform.metadata?.id }, 'Guild extraction for guild is running');
  try {
    const hasBotAccessToGuild = await platformService.checkBotAccessToGuild(platform.metadata?.id);
    if (!hasBotAccessToGuild) {
      return;
    }
    const guild = await client.guilds.fetch(platform.metadata?.id);
    if (platform.metadata?.selectedChannels && platform.metadata?.period) {
      await platformService.updatePlatform({ _id: platform.id }, { metadata: { isInProgress: true } });

      for (let i = 0; i < platform.metadata?.selectedChannels.length; i++) {
        const channel = await guild.channels.fetch(platform.metadata?.selectedChannels[i]);
        if (channel) {
          if (channel.type !== 0) continue;
          await handleFetchChannelMessages(connection, channel, platform.metadata?.period);
        }
      }
    }
  } catch (err) {
    logger.error({ guild_id: platform.metadata?.id, err }, 'Guild extraction CronJob failed for guild');
  }
  logger.info({ guild_id: platform.metadata?.id }, 'Guild extraction for guild is done');
}
