import { Message, Role, Snowflake, TextChannel, User } from 'discord.js';
import { Connection } from 'mongoose';
import fetch from 'node-fetch';

import { IDiscordUser, IRawInfo } from '@togethercrew.dev/db';

import config from '../config';
import parentLogger from '../config/logger';

const logger = parentLogger.child({ module: 'discordMessageUtils' })


export async function fetchAllUsersForReaction(
    channelId: string,
    messageId: string,
    encodedEmoji: string
): Promise<IDiscordUser[]> {
    let users: IDiscordUser[] = []
    let after = ''
    const limit = 100
    let hasMore = true

    while (hasMore) {
        const url = `https://discord.com/api/v9/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}?limit=${limit}${
            after ? `&after=${after}` : ''
        }`
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bot ${config.discord.botToken}`,
                'Content-Type': 'application/json',
            },
        })

        if (response.ok) {
            const fetchedUsers: IDiscordUser[] = await response.json()
            users = users.concat(fetchedUsers)
            if (fetchedUsers.length < limit) {
                hasMore = false
            } else {
                after = fetchedUsers[fetchedUsers.length - 1].id
            }
        } else if (response.status === 429) {
            const rateLimitInfo = await response.json()
            const retryAfter = rateLimitInfo.retry_after * 1000
            logger.warn(
                { channel_id: channelId, message_id: messageId },
                `Rate limited for emoji: ${encodedEmoji}. Retrying after ${rateLimitInfo.retry_after} seconds.`
            )
            await new Promise((resolve) => setTimeout(resolve, retryAfter))
            continue
        } else {
            const errorText = await response.text()
            logger.error({ channelId, messageId, errorText }, 'Error fetching users for reaction')
            hasMore = false
        }
    }
    return users
}

/**
 * Extracts a list of reaction strings from a message.
 */
export async function getReactions(message: Message): Promise<string[]> {
    try {
        const reactionsArr: string[] = []
        for (const reaction of message.reactions.cache.values()) {
            const emoji = reaction.emoji
            let encodedEmoji: string

            if (emoji.id) {
                encodedEmoji = encodeURIComponent(`${emoji.name}:${emoji.id}`)
            } else if (emoji.name) {
                encodedEmoji = encodeURIComponent(emoji.name)
            } else {
                logger.error(
                    { guild_id: message.guildId, channel_id: message.channel.id, message_id: message.id, emoji },
                    'Emoji name is null or undefined.'
                )
                continue
            }

            const users = await fetchAllUsersForReaction(message.channel.id, message.id, encodedEmoji)
            const usersString = users.map((u) => u.id).join(',')
            reactionsArr.push(`${usersString},${emoji.name}`)
        }
        return reactionsArr
    } catch (error) {
        return []
    }
}

export interface ThreadInfo {
    threadId: Snowflake
    threadName: string
    channelId?: Snowflake
    channelName?: string
}

/**
 * Constructs an IRawInfo object from a Discord message.
 */
export async function getNeedDataFromMessage(message: Message, threadInfo?: ThreadInfo): Promise<IRawInfo> {
    return {
        type: message.type,
        author: message.author.id,
        content: message.content,
        createdDate: message.createdAt,
        role_mentions: message.mentions.roles.map((r: Role) => r.id),
        user_mentions: message.mentions.users.map((u: User) => u.id),
        replied_user: message.type === 19 ? message.mentions.repliedUser?.id : null,
        reactions: await getReactions(message),
        messageId: message.id,
        channelId: threadInfo?.channelId ?? message.channelId,
        channelName: threadInfo?.channelName ?? (message.channel instanceof TextChannel ? message.channel.name : null),
        threadId: threadInfo?.threadId ?? null,
        threadName: threadInfo?.threadName ?? null,
        isGeneratedByWebhook: Boolean(message.webhookId),
    }
}

/**
 * Filters messages by type and appends their raw info to an array.
 */
export async function pushMessagesToArray(
    connection: Connection,
    arr: IRawInfo[],
    messagesArray: Message[],
    threadInfo?: ThreadInfo
): Promise<IRawInfo[]> {
    const allowedTypes = [0, 18, 19]
    for (const message of messagesArray) {
        if (allowedTypes.includes(message.type)) {
            arr.push(await getNeedDataFromMessage(message, threadInfo))
        }
    }
    return arr
}
