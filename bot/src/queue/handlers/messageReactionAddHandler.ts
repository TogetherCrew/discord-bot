// src/queue/handlers/messageReactionAddHandler.ts
import { Snowflake } from 'discord.js';

import { DatabaseManager, IRawInfoUpdateBody } from '@togethercrew.dev/db';

import parentLogger from '../../config/logger';
import { rawInfoService } from '../../database/services';
import { isUserIgnoredForGuild } from '../../utils/guildIgnoredUsers';

const logger = parentLogger.child({ event: 'MessageReactionAddHandler' })

/**
 * Given an array like ["u1,u2,👍", "u1,💩"], this:
 *  - finds the entry ending with ",emoji"
 *  - if found and user not present, inserts user before the emoji
 *  - otherwise pushes "user,emoji"
 */
function upsertReaction(current: string[], userId: string, emoji: string): string[] {
    const idx = current.findIndex((entry) => entry.endsWith(`,${emoji}`))

    if (idx !== -1) {
        const parts = current[idx].split(',')
        const users = parts.slice(0, -1)
        if (!users.includes(userId)) {
            // insert the new user just before the emoji
            parts.splice(parts.length - 1, 0, userId)
            current[idx] = parts.join(',')
        }
    } else {
        // new emoji entirely
        current.push(`${userId},${emoji}`)
    }

    return current
}

export default async function handleReactionAdd(
    guildId: Snowflake,
    messageId: Snowflake,
    channelId: Snowflake,
    userId: Snowflake,
    emoji: string // this is already the emoji.name from above
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
        const after = upsertReaction([...before], userId, emoji)

        const changed = after.length !== before.length || after.some((val, i) => val !== before[i])

        if (changed) {
            await rawInfoService.updateRawInfo(db, { messageId }, { reactions: after } as IRawInfoUpdateBody)
        }
    } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle reaction add')
    }
}
