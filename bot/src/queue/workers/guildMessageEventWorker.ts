import { Job, Worker } from 'bullmq'
import { Events } from 'discord.js'

import { redisConfig } from '../../config/queue'
import {
    messageCreateHandler,
    messageDeleteBulkHandler,
    messageDeleteHandler,
    messageReactionAddHandler,
    messageReactionRemoveAllHandler,
    messageReactionRemoveEmojiHandler,
    messageReactionRemoveHandler,
    messageUpdateHandler,
} from '../handlers'
import { WorkerFactory } from './index'

export const discordEventWorker = new Worker(
    'guildMessageEventQueue',
    async (job: Job<any, any, string> | undefined) => {
        if (job !== null && job !== undefined) {
            switch (job.data.type) {
                case Events.MessageCreate: {
                    await messageCreateHandler(job.data.guildId, job.data.dataToStore)
                    break
                }
                case Events.MessageDelete: {
                    await messageDeleteHandler(job.data.guildId, job.data.messageId, job.data.channelId)
                    break
                }
                case Events.MessageBulkDelete: {
                    await messageDeleteBulkHandler(job.data.guildId, job.data.messageIds, job.data.channelId)
                    break
                }
                case Events.MessageReactionAdd: {
                    await messageReactionAddHandler(
                        job.data.guildId,
                        job.data.messageId,
                        job.data.channelId,
                        job.data.userId,
                        job.data.emoji
                    )
                    break
                }
                case Events.MessageReactionRemove: {
                    await messageReactionRemoveHandler(
                        job.data.guildId,
                        job.data.messageId,
                        job.data.channelId,
                        job.data.userId,
                        job.data.emoji
                    )
                    break
                }
                case Events.MessageReactionRemoveAll: {
                    await messageReactionRemoveAllHandler(job.data.guildId, job.data.messageId, job.data.channelId)
                    break
                }
                case Events.MessageReactionRemoveEmoji: {
                    await messageReactionRemoveEmojiHandler(
                        job.data.guildId,
                        job.data.messageId,
                        job.data.channelId,
                        job.data.emoji
                    )
                    break
                }
                case Events.MessageUpdate: {
                    await messageUpdateHandler(job.data.guildId, job.data.dataToStore)
                    break
                }
            }
        }
    },
    {
        connection: redisConfig,
        concurrency: 20,
    }
)

WorkerFactory.attachEventListeners(discordEventWorker)
