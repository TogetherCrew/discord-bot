// src/queue/handlers/messageDeleteBulkHandler.ts
import { Snowflake } from 'discord.js'

import { DatabaseManager } from '@togethercrew.dev/db'

import parentLogger from '../../config/logger'
import { rawInfoService } from '../../database/services'

const logger = parentLogger.child({ event: 'MessageDeleteBulkHandler' })

export default async function (guildId: Snowflake, messageIds: Snowflake[], channelId: Snowflake): Promise<void> {
    const logFields = {
        guild_id: guildId,
        channel_id: channelId,
        message_count: messageIds.length,
    }

    const connection = await DatabaseManager.getInstance().getGuildDb(guildId)
    try {
        await rawInfoService.deleteManyRawInfo(connection, { messageId: { $in: messageIds } })
    } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle message bulk delete')
    }
}
