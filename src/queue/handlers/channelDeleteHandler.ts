import { type Snowflake } from 'discord.js';
import { channelService, platformService } from '../../database/services';
import { DatabaseManager } from '@togethercrew.dev/db';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'ChannelDeleteHandler' });

export default async function (guildId: Snowflake, channelId: Snowflake): Promise<void> {
  const logFields = { guild_id: guildId, channel_id: channelId };
  logger.info(logFields, 'event is running');
  const connection = await DatabaseManager.getInstance().getTenantDb(guildId);
  try {
    const channelDoc = await channelService.getChannel(connection, { channelId });
    channelDoc?.softDelete();
    const platformDoc = await platformService.getPlatform({ 'metadata.id': guildId });
    const updatedSelecetdChannels = platformDoc?.metadata?.selectedChannels?.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (selectedChannel: any) => selectedChannel.channelId !== channelId,
    );
    await platformService.updatePlatform(
      { 'metadata.id': guildId },
      { metadata: { selectedChannels: updatedSelecetdChannels } },
    );
    logger.info(logFields, 'event is done');
  } catch (err) {
    logger.error({ ...logFields, err }, 'Failed to soft delete the channel');
  }

}
