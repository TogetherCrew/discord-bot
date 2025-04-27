// src/queue/handlers/messageReactionRemoveAllHandler.ts
import { Snowflake } from 'discord.js'

import { DatabaseManager, IRawInfoUpdateBody } from '@togethercrew.dev/db'

import parentLogger from '../../config/logger'
import { rawInfoService } from '../../database/services'

const logger = parentLogger.child({ event: 'MessageReactionRemoveAllHandler' })

export default async function handleRemoveAll(
    guildId: Snowflake,
    messageId: Snowflake,
    channelId: Snowflake
): Promise<void> {
    const logFields = { guild_id: guildId, message_id: messageId, channel_id: channelId }

    const db = await DatabaseManager.getInstance().getGuildDb(guildId)
    try {
        await rawInfoService.updateRawInfo(db, { messageId }, { reactions: [] } as IRawInfoUpdateBody)
    } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle message reaction remove all')
    }
}
