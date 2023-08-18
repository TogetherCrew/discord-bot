import { Events, Channel, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { channelService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'ChannelUpdate' });

export default {
  name: Events.ChannelUpdate,
  once: false,
  async execute(oldChannel: Channel, newChannel: Channel) {
    if (
      newChannel instanceof TextChannel ||
      newChannel instanceof VoiceChannel ||
      newChannel instanceof CategoryChannel
    ) {
      const logFields = { guild_id: newChannel.guild.id, channel_id: newChannel.id };
      logger.info(logFields, 'event is running');
      const connection = databaseService.connectionFactory(newChannel.guild.id, config.mongoose.dbURL);
      try {
        await channelService.handelChannelChanges(connection, newChannel);
      } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle channel changes');
      } finally {
        await closeConnection(connection);
        logger.info(logFields, 'event is done');
      }
    }
  },
};
