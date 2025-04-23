// src/queue/handlers/messageReactionRemoveHandler.ts
import { Snowflake } from 'discord.js';

import { DatabaseManager, IRawInfoUpdateBody } from '@togethercrew.dev/db';

import parentLogger from '../../config/logger';
import { rawInfoService } from '../../database/services';
import { isUserIgnoredForGuild } from '../../utils/guildIgnoredUsers';

const logger = parentLogger.child({ event: 'MessageReactionRemoveHandler' })

/**
 * Remove a user from the "<user1>,<user2>,emoji" entry.
 * If no users remain, drop that entry entirely.
 */
function removeReaction(current: string[], userId: string, emoji: string): string[] {
    const idx = current.findIndex((entry) => entry.endsWith(`,${emoji}`))
    if (idx === -1) return current

    const parts = current[idx].split(',')
    const users = parts.slice(0, -1).filter((u) => u !== userId)

    if (users.length) {
        current[idx] = [...users, emoji].join(',')
    } else {
        current.splice(idx, 1)
    }

    return current
}

export default async function handleReactionRemove(
    guildId: Snowflake,
    messageId: Snowflake,
    channelId: Snowflake,
    userId: Snowflake,
    emoji: string
): Promise<void> {
    const logFields = { guild_id: guildId, message_id: messageId, channel_id: channelId, user_id: userId }

    if (isUserIgnoredForGuild(guildId, userId)) return

    const db = await DatabaseManager.getInstance().getGuildDb(guildId)
    try {
        const raw = await rawInfoService.getRawInfo(db, { messageId })
        if (!raw) {
            logger.warn({ ...logFields }, 'rawInfo not found for message')
            return
        }

        const before = raw.reactions || []
        const after = removeReaction([...before], userId, emoji)

        const changed = after.length !== before.length || after.some((v, i) => v !== before[i])

        if (changed) {
            await rawInfoService.updateRawInfo(db, { messageId }, { reactions: after } as IRawInfoUpdateBody)
        }
    } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle message reaction remove')
    }
}
