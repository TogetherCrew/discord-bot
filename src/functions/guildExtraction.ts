import { type HydratedDocument } from 'mongoose';
import { type IPlatform, DatabaseManager } from '@togethercrew.dev/db';
import { platformService } from '../database/services';
import fetchMessages from './fetchMessages';
import parentLogger from '../config/logger';

const logger = parentLogger.child({ module: 'GuildExtraction' });
/**
 * Extracts information from a given guild.
 * @param {Snowflake} guildId - The identifier of the guild to extract information from.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function guildExtraction(platform: HydratedDocument<IPlatform>) {
  const connection = await DatabaseManager.getInstance().getTenantDb(platform.metadata?.id);
  logger.info({ guild_id: platform.metadata?.id }, 'Guild extraction for guild is running');
  try {
    const hasBotAccessToGuild = await platformService.checkBotAccessToGuild(platform.metadata?.id);
    if (!hasBotAccessToGuild) {
      return;
    }
    await fetchMessages(connection, platform);
  } catch (err) {
    logger.error({ guild_id: platform.metadata?.id, err }, 'Guild extraction CronJob failed for guild');
  }
  logger.info({ guild_id: platform.metadata?.id }, 'Guild extraction for guild is done');
}
