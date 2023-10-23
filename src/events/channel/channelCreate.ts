import { Events, Channel, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { channelService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'ChannelCreate' });

export default {
  name: Events.ChannelCreate,
  once: false,
  async execute(channel: Channel) {
    if (channel instanceof TextChannel || channel instanceof VoiceChannel || channel instanceof CategoryChannel) {
      const logFields = { guild_id: channel.guild.id, channel_id: channel.id };
      logger.info(logFields, 'event is running');
      const connection = databaseService.connectionFactory(channel.guild.id, config.mongoose.dbURL);
      try {
        await channelService.handelChannelChanges(connection, channel);
      } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle channel changes');
      } finally {
        await closeConnection(connection);
        logger.info(logFields, 'event is done');
      }
    }
  },
};
