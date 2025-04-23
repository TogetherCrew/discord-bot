// src/queue/handlers/messageReactionRemoveEmojiHandler.ts
import { Snowflake } from 'discord.js';

import { DatabaseManager, IRawInfoUpdateBody } from '@togethercrew.dev/db';

import parentLogger from '../../config/logger';
import { rawInfoService } from '../../database/services';

const logger = parentLogger.child({ event: 'MessageReactionRemoveEmojiHandler' })


function removeEmojiEntry(current: string[], emoji: string): string[] {
    return current.filter((entry) => !entry.endsWith(`,${emoji}`))
}

export default async function handleRemoveEmoji(
    guildId: Snowflake,
    messageId: Snowflake,
    channelId: Snowflake,
    emoji: string
): Promise<void> {
    const logFields = { guild_id: guildId, message_id: messageId, channel_id: channelId }

    const db = await DatabaseManager.getInstance().getGuildDb(guildId)
    try {
        const raw = await rawInfoService.getRawInfo(db, { messageId })
        if (!raw) {
            logger.warn({ ...logFields }, 'rawInfo not found for message')
            return
        }

        const before = raw.reactions || []
        const after = removeEmojiEntry([...before], emoji)

        const changed = after.length !== before.length || after.some((v, i) => v !== before[i])

        if (changed) {
            await rawInfoService.updateRawInfo(db, { messageId }, { reactions: after } as IRawInfoUpdateBody)
        }
    } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle message reaction remove emoji')
    }
}
