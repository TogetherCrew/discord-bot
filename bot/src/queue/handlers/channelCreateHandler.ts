import { type Snowflake } from 'discord.js'
import { channelService } from '../../database/services'
import { DatabaseManager, type IChannel } from '@togethercrew.dev/db'
import parentLogger from '../../config/logger'

const logger = parentLogger.child({ event: 'ChannelCreateHandler' })

export default async function (
    guildId: Snowflake,
    dataToStore: IChannel
): Promise<void> {
    const logFields = { guild_id: guildId, channel_id: dataToStore.channelId }
    // logger.info(logFields, 'event is running');
    const connection = await DatabaseManager.getInstance().getGuildDb(guildId)
    try {
        const channelDoc = await channelService.updateChannel(
            connection,
            { channelId: dataToStore.channelId },
            dataToStore
        )
        if (channelDoc === null) {
            await channelService.createChannel(connection, dataToStore)
        }
        // logger.info(logFields, 'event is done');
    } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle channel changes')
    }
}
