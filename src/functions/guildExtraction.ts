import { type HydratedDocument } from 'mongoose';
import { type IPlatform, DatabaseManager } from '@togethercrew.dev/db';
import { platformService } from '../database/services';
import handleFetchChannelMessages from './fetchMessages';
import parentLogger from '../config/logger';
import { sagaService } from '../rabbitmq/services';
import { coreService } from '../services';

const logger = parentLogger.child({ module: 'GuildExtraction' });
/**
 * Extracts information from a given guild.
 * @param {Snowflake} guildId - The identifier of the guild to extract information from.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function guildExtraction(platform: HydratedDocument<IPlatform>) {
  console.log('Extract', platform.metadata?.name);
  const connection = await DatabaseManager.getInstance().getTenantDb(platform.metadata?.id);
  const client = await coreService.DiscordBotManager.getClient();
  // logger.info({ guild_id: platform.metadata?.id }, 'Guild extraction for guild is running');
  try {
    const hasBotAccessToGuild = await platformService.checkBotAccessToGuild(platform.metadata?.id);
    if (!hasBotAccessToGuild) {
      return;
    }
    const guild = await client.guilds.fetch(platform.metadata?.id);
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (platform.metadata?.selectedChannels && platform.metadata?.period) {
      await platformService.updatePlatform({ _id: platform.id }, { metadata: { isInProgress: true } });
      for (let i = 0; i < platform.metadata?.selectedChannels.length; i++) {
        const channel = await guild.channels.fetch(platform.metadata?.selectedChannels[i]);
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (channel) {
          if (channel.type !== 0) continue;
          await handleFetchChannelMessages(connection, channel, platform.metadata?.period);
        }
      }
      await sagaService.createAndStartDiscordScheduledJobsaga(platform.id);
    }
  } catch (err) {
    logger.error({ guild_id: platform.metadata?.id, err }, 'Guild extraction CronJob failed for guild');
  }
  // logger.info({ guild_id: platform.metadata?.id }, 'Guild extraction for guild is done');
}
