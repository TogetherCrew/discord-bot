// services/ignoreUsers.service.ts
import { Snowflake } from 'discord.js';

import { DatabaseManager, Platform } from '@togethercrew.dev/db';

import { Guild_IGNORED_USERS } from '../config/guildIgnoredUsers';
import parentLogger from '../config/logger';

const logger = parentLogger.child({ event: 'guildIgnoreUsers' })

/**
 * Retrieves the list of ignored user IDs for a given guildId.
 *
 * @param guildId - The unique identifier for the platform.
 * @returns An array of user IDs that should be ignored.
 */
function getIgnoredUsersForGuild(guildId: string): Snowflake[] {
    return Guild_IGNORED_USERS[guildId] || []
}

/**
 * Checks if a given user ID is in the ignore list for a specific platform.
 *
 * @param guildId - The platform identifier as a string.
 * @param discordId - The user’s Snowflake ID (from Discord).
 * @returns True if the user is ignored, otherwise false.
 */
export function isUserIgnoredForGuild(guildId: string, discordId: Snowflake): boolean {
    const ignoredUsers = getIgnoredUsersForGuild(guildId)
    return ignoredUsers.includes(discordId)
}

/**
 * Removes all GuildMembers whose Discord IDs are on the ignored-user list for a given guild.
 *
 * @param guildId - The guild's identifier as a string.
 */
export async function removeIgnoredGuildMembers(guildId: string): Promise<void> {
    try {
        const ignoredUserIds: Snowflake[] = getIgnoredUsersForGuild(guildId)
        if (!ignoredUserIds.length) {
            return
        }

        const platform = await Platform.findOne({ 'metadata.id': guildId })
        if (!platform) {
            return
        }

        const guildConnection = await DatabaseManager.getInstance().getGuildDb(guildId)

        await guildConnection.models.GuildMember.deleteMany({ discordId: { $in: ignoredUserIds } })
    } catch (error) {
        logger.error(error, `Failed to remove ignored GuildMembers for guild ${guildId}`)
    }
}

/**
 * Cleans up RawInfo documents for a given guild by removing or updating entries
 * for any user that is on the ignore list.
 *
 * - Removes RawInfo docs where `author` is in the ignore list.
 * - Sets `replied_user` to null if it’s in the ignore list.
 * - Pulls ignored users from the `user_mentions` array.
 *
 * @param guildId - The guild's identifier as a string.
 */
export async function sanitizeRawInfoForIgnoredUsers(guildId: string): Promise<void> {
    try {
        const ignoredUserIds: Snowflake[] = getIgnoredUsersForGuild(guildId)
        if (!ignoredUserIds.length) {
            return
        }

        const platform = await Platform.findOne({ 'metadata.id': guildId })
        if (!platform) {
            return
        }

        const guildConnection = await DatabaseManager.getInstance().getGuildDb(guildId)

        await guildConnection.models.RawInfo.deleteMany({
            author: { $in: ignoredUserIds },
        })

        await guildConnection.models.RawInfo.updateMany(
            { replied_user: { $in: ignoredUserIds } },
            { $set: { replied_user: null } }
        )

        await guildConnection.models.RawInfo.updateMany(
            { user_mentions: { $elemMatch: { $in: ignoredUserIds } } },
            { $pull: { user_mentions: { $in: ignoredUserIds } } }
        )
        console.log(ignoredUserIds)

        await guildConnection.models.RawInfo.updateMany({}, [
            {
                $set: {
                    reactions: {
                        $map: {
                            input: '$reactions',
                            as: 'reaction',
                            in: {
                                $let: {
                                    vars: {
                                        parts: { $split: ['$$reaction', ','] },
                                    },
                                    in: {
                                        $reduce: {
                                            input: {
                                                $filter: {
                                                    input: '$$parts',
                                                    as: 'part',
                                                    cond: {
                                                        $not: [{ $in: ['$$part', ignoredUserIds] }],
                                                    },
                                                },
                                            },
                                            initialValue: '',
                                            in: {
                                                $cond: [
                                                    { $eq: ['$$value', ''] },
                                                    '$$this',
                                                    { $concat: ['$$value', ',', '$$this'] },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            {
                $set: {
                    reactions: {
                        $filter: {
                            input: '$reactions',
                            as: 'finalStr',
                            cond: { $ne: ['$$finalStr', ''] },
                        },
                    },
                },
            },
            {
                $set: {
                    reactions: {
                        $filter: {
                            input: '$reactions',
                            as: 'finalStr',
                            cond: {
                                $regexMatch: {
                                    input: '$$finalStr',
                                    regex: /\d/,
                                },
                            },
                        },
                    },
                },
            },
        ])
    } catch (error) {
        logger.error(error, `Failed to sanitize RawInfo for ignored users in guild ${guildId}`)
    }
}
