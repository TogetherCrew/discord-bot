import { Events, type Channel, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { channelService } from '../../database/services';
import { DatabaseManager } from '@togethercrew.dev/db';
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
      const connection = await DatabaseManager.getInstance().getTenantDb(newChannel.guild.id);
      try {
        await channelService.handelChannelChanges(connection, newChannel);
        logger.info(logFields, 'event is done');
      } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle channel changes');
      }
    }
  },
};
