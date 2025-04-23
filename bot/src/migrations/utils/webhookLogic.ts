/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Message, Snowflake, TextChannel, ThreadChannel } from 'discord.js';
import { Connection } from 'mongoose';

import { IRawInfo } from '@togethercrew.dev/db';

import parentLogger from '../../config/logger';
import { channelService, rawInfoService } from '../../database/services';
import { coreService } from '../../services';

const logger = parentLogger.child({ module: 'Migration' })

interface FetchOptions {
    limit: number
    before?: Snowflake
    after?: Snowflake
}

async function fetchMessagesBetweenOldestAndNewest(
    connection: Connection,
    channel: TextChannel | ThreadChannel,
    oldestRawInfo: IRawInfo,
    newestRawInfo: IRawInfo
) {
    try {
        let allMessages: Message[] = []
        logger.info({ guild_id: connection.name, channel_id: channel.id }, 'Fetching channel messages is running')
        const options: FetchOptions = { limit: 100 }
        options.after = oldestRawInfo.messageId
        let fetchedMessages = await channel.messages.fetch(options)
        while (fetchedMessages.size > 0) {
            allMessages = allMessages.concat(Array.from(fetchedMessages.values()))
            if (fetchedMessages.has(newestRawInfo.messageId)) {
                break
            }
            options.after = fetchedMessages.first()?.id
            fetchedMessages = await channel.messages.fetch(options)
        }
        return allMessages
    } catch (err) {
        logger.error({ guild_id: connection.name, channel_id: channel.id, err }, 'Fetching channel messages failed')
    }
    logger.info({ guild_id: connection.name, channel_id: channel.id }, 'Fetching channel messages is done')
}

async function migrateIsGeneratedByWebhook(connection: Connection, channel: TextChannel) {
    try {
        logger.info(
            { guild_id: connection.name, channel_id: channel.id },
            'Migration for isGeneratedByWebhook is running'
        )

        // Fetch oldest rawInfo from DB
        const oldestChannelRawInfo = await rawInfoService.getOldestRawInfo(connection, {
            channelId: channel?.id,
            threadId: null,
        })

        // Fetch newest rawInfo from DB
        const newestChannelRawInfo = await rawInfoService.getNewestRawInfo(connection, {
            channelId: channel?.id,
            threadId: null,
        })

        if (!oldestChannelRawInfo || !newestChannelRawInfo) {
            logger.info(
                { guild_id: connection.name, channel_id: channel.id },
                'No oldest rawInfo found, skipping migration'
            )
            return
        }

        const fetchedMessages = await fetchMessagesBetweenOldestAndNewest(
            connection,
            channel,
            oldestChannelRawInfo,
            newestChannelRawInfo
        )
        const messagesToUpdateTrue = []
        const messagesToUpdateFalse = []

        const oldestMessage = await channel.messages.fetch(oldestChannelRawInfo.messageId)
        const newestMessage = await channel.messages.fetch(newestChannelRawInfo.messageId)

        if (oldestMessage.webhookId) messagesToUpdateTrue.push(oldestMessage.id)
        else messagesToUpdateFalse.push(oldestMessage.id)

        if (newestMessage.webhookId) messagesToUpdateTrue.push(newestMessage.id)
        else messagesToUpdateFalse.push(newestMessage.id)

        if (fetchedMessages) {
            for (const message of fetchedMessages) {
                if (message.webhookId) {
                    messagesToUpdateTrue.push(message.id)
                } else {
                    messagesToUpdateFalse.push(message.id)
                }
            }
        }

        if (messagesToUpdateTrue.length > 0) {
            await rawInfoService.updateManyRawInfo(
                connection,
                { messageId: { $in: messagesToUpdateTrue } },
                { isGeneratedByWebhook: true }
            )
        }

        if (messagesToUpdateFalse.length > 0) {
            await rawInfoService.updateManyRawInfo(
                connection,
                { messageId: { $in: messagesToUpdateFalse } },
                { isGeneratedByWebhook: false }
            )
        }

        const threads = channel.threads.cache.values()

        // Handle threads of the channel
        for (const thread of threads) {
            const oldestThreadRawInfo = await rawInfoService.getOldestRawInfo(connection, {
                channelId: channel?.id,
                threadId: thread.id,
            })

            const newestThreadRawInfo = await rawInfoService.getNewestRawInfo(connection, {
                channelId: channel?.id,
                threadId: thread.id,
            })

            if (!oldestThreadRawInfo || !newestThreadRawInfo) {
                continue // No data to migrate for this thread
            }

            const fetchedThreadMessages = await fetchMessagesBetweenOldestAndNewest(
                connection,
                thread,
                oldestThreadRawInfo,
                newestThreadRawInfo
            )

            const threadMessagesToUpdateTrue = []
            const threadMessagesToUpdateFalse = []

            const oldestThreadMessage = await thread.messages.fetch(oldestThreadRawInfo.messageId)
            const newestThreadMessage = await thread.messages.fetch(newestThreadRawInfo.messageId)

            if (oldestThreadMessage.webhookId) threadMessagesToUpdateTrue.push(oldestThreadMessage.id)
            else threadMessagesToUpdateFalse.push(oldestThreadMessage.id)

            if (newestThreadMessage.webhookId) threadMessagesToUpdateTrue.push(newestThreadMessage.id)
            else threadMessagesToUpdateFalse.push(newestThreadMessage.id)

            if (fetchedThreadMessages) {
                for (const message of fetchedThreadMessages) {
                    if (message.webhookId) {
                        threadMessagesToUpdateTrue.push(message.id)
                    } else {
                        threadMessagesToUpdateFalse.push(message.id)
                    }
                }
            }

            if (threadMessagesToUpdateTrue.length > 0) {
                await rawInfoService.updateManyRawInfo(
                    connection,
                    { messageId: { $in: threadMessagesToUpdateTrue } },
                    { isGeneratedByWebhook: true }
                )
            }

            if (threadMessagesToUpdateFalse.length > 0) {
                await rawInfoService.updateManyRawInfo(
                    connection,
                    { messageId: { $in: threadMessagesToUpdateFalse } },
                    { isGeneratedByWebhook: false }
                )
            }
        }

        logger.info({ guild_id: connection.name, channel_id: channel.id }, 'Migration for isGeneratedByWebhook is done')
    } catch (err) {
        logger.error(
            { guild_id: connection.name, channel_id: channel.id, err },
            'Migration for isGeneratedByWebhook failed'
        )
    }
}

/**
 *
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Snowflake} guildId - The identifier of the guild to extract information from.
 */
async function runRawInfoMigration(connection: Connection, guildId: Snowflake) {
    const bot = coreService.DiscordBotManager.getInstance()
    const client = await bot.getClient()
    logger.info({ guild_id: guildId }, 'Migration is running')
    try {
        const guild = await client.guilds.fetch(guildId)
        const channels = await channelService.getChannels(connection, {})
        for (let i = 0; i < channels.length; i++) {
            const channel = await guild.channels.fetch(channels[i].channelId)
            if (channel) {
                if (channel.type !== 0) continue
                await migrateIsGeneratedByWebhook(connection, channel)
            }
        }
    } catch (err) {
        logger.error({ guild_id: guildId, err }, 'Migration is failed')
    }
    logger.info({ guild_id: guildId }, 'Migration is done')
}

export default runRawInfoMigration
