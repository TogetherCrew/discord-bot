// src/queue/handlers/messageUpdateHandler.ts
import { Snowflake } from 'discord.js'

import { DatabaseManager, IRawInfo } from '@togethercrew.dev/db'

import parentLogger from '../../config/logger'
import { rawInfoService } from '../../database/services'
import { isUserIgnoredForGuild } from '../../utils/guildIgnoredUsers'

const logger = parentLogger.child({ event: 'MessageUpdateHandler' })

export default async function (guildId: Snowflake, dataToStore: IRawInfo): Promise<void> {
    const logFields = {
        guild_id: guildId,
        message_id: dataToStore.messageId,
    }

    if (isUserIgnoredForGuild(guildId, dataToStore.author)) return

    const connection = await DatabaseManager.getInstance().getGuildDb(guildId)
    try {
        await rawInfoService.updateRawInfo(connection, { messageId: dataToStore.messageId }, dataToStore)
    } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle message update')
    }
}
