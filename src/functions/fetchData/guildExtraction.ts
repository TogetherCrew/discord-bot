import { Client, Snowflake } from 'discord.js';
import { guildService } from '../../database/services';
import handleFetchChannelMessages from './fetchMessages';
import { Connection } from 'mongoose';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ module: 'GuildExtraction' });
/**
 * Extracts information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Client} client - The discord.js client object used to fetch the guild.
 * @param {Snowflake} guildId - The identifier of the guild to extract information from.
 */
export default async function guildExtraction(connection: Connection, client: Client, guildId: Snowflake) {
  logger.info({ guild_id: guildId }, 'Guild extraction for guild is running');
  try {
    const hasBotAccessToGuild = await guildService.checkBotAccessToGuild(client, guildId);
    if (!hasBotAccessToGuild) {
      return;
    }
    const guild = await client.guilds.fetch(guildId);
    const guildDoc = await guildService.getGuild({ guildId });
    if (guildDoc && guildDoc.selectedChannels && guildDoc.period) {
      await guildService.updateGuild({ guildId }, { isInProgress: true });
      const selectedChannelsIds = guildDoc.selectedChannels.map(selectedChannel => selectedChannel.channelId);
      for (const channelId of selectedChannelsIds) {
        const channel = await guild.channels.fetch(channelId);
        if (channel) {
          if (channel.type !== 0) continue;
          await handleFetchChannelMessages(connection, channel, guildDoc?.period);
        }
      }
    }
  } catch (err) {
    logger.error({ guild_id: guildId, err }, 'Guild extraction CronJob failed for guild');
  }
  logger.info({ guild_id: guildId }, 'Guild extraction for guild is done');
}
