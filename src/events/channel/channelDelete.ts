import { Events, Channel, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { channelService, guildService } from '../../database/services';
import { DatabaseManager } from '@togethercrew.dev/db';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'ChannelDelete' });

export default {
  name: Events.ChannelDelete,
  once: false,
  async execute(channel: Channel) {
    if (channel instanceof TextChannel || channel instanceof VoiceChannel || channel instanceof CategoryChannel) {
      const logFields = { guild_id: channel.guild.id, channel_id: channel.id };
      logger.info(logFields, 'event is running');
      const connection = DatabaseManager.getInstance().getTenantDb(channel.guild.id);
      try {
        const channelDoc = await channelService.getChannel(connection, { channelId: channel.id });
        await channelDoc?.softDelete();
        const guildDoc = await guildService.getGuild({ guildId: channel.guild.id });
        const updatedSelecetdChannels = guildDoc?.selectedChannels?.filter(
          selectedChannel => selectedChannel.channelId !== channel.id
        );
        await guildService.updateGuild({ guildId: channel.guild.id }, { selectedChannels: updatedSelecetdChannels });
        logger.info(logFields, 'event is done');

      } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to soft delete the channel');
      }
    }
  },
};
