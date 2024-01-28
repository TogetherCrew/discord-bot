import { Events, type Channel, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { channelService, platformService } from '../../database/services';
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
      const connection = await DatabaseManager.getInstance().getTenantDb(channel.guild.id);
      try {
        const channelDoc = await channelService.getChannel(connection, { channelId: channel.id });
        channelDoc?.softDelete();
        const platformDoc = await platformService.getPlatform({ 'metadata.id': channel.guild.id });
        const updatedSelecetdChannels = platformDoc?.metadata?.selectedChannels?.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (selectedChannel: any) => selectedChannel.channelId !== channel.id,
        );
        await platformService.updatePlatform(
          { 'metadata.id': channel.guild.id },
          { metadata: { selectedChannels: updatedSelecetdChannels } },
        );
        logger.info(logFields, 'event is done');
      } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to soft delete the channel');
      }
    }
  },
};
