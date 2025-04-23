// src/queue/handlers/messageDeleteHandler.ts
import { Snowflake } from 'discord.js'

import { DatabaseManager } from '@togethercrew.dev/db'

import parentLogger from '../../config/logger'
import { rawInfoService } from '../../database/services'

const logger = parentLogger.child({ event: 'MessageDeleteHandler' })

export default async function (guildId: Snowflake, messageId: Snowflake, channelId: Snowflake): Promise<void> {
    const logFields = {
        guild_id: guildId,
        message_id: messageId,
        channel_id: channelId,
    }

    const connection = await DatabaseManager.getInstance().getGuildDb(guildId)
    try {
        await rawInfoService.deleteRawInfo(connection, { messageId })
    } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle message delete')
    }
}
