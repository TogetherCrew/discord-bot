import { Events, Channel, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { channelService } from '../../database/services';
import { DatabaseManager } from '@togethercrew.dev/db';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'ChannelCreate' });

export default {
  name: Events.ChannelCreate,
  once: false,
  async execute(channel: Channel) {
    if (channel instanceof TextChannel || channel instanceof VoiceChannel || channel instanceof CategoryChannel) {
      const logFields = { guild_id: channel.guild.id, channel_id: channel.id };
      logger.info(logFields, 'event is running');
      const connection = await DatabaseManager.getInstance().getTenantDb(channel.guild.id);
      try {
        await channelService.handelChannelChanges(connection, channel);
        logger.info(logFields, 'event is done');
      } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle channel changes');
      }
    }
  },
};
