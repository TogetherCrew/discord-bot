import { WorkerFactory } from './index'
import { Worker, type Job } from 'bullmq'
import { redisConfig } from '../../config/queue'
import { Events } from 'discord.js'
import {
    channelCreateHandler,
    channelUpdateHandler,
    channelDeleteHandler,
    guildMemberAddHandler,
    guildMemberUpdateHandler,
    guildMemberRemoveHandler,
    roleCreateHandler,
    roleUpdateHandler,
    roleDeleteHandler,
    userUpdateHandler,
    messageCreateHandler,
    messageDeleteHandler,
    messageDeleteBulkHandler,
    messageReactionAddHandler,
    messageReactionRemoveHandler,
    messageReactionRemoveAllHandler,
    messageReactionRemoveEmojiHandler,
    messageUpdateHandler,
} from '../handlers'

export const discordEventWorker = new Worker(
    'guildEventQueue',
    async (job: Job<any, any, string> | undefined) => {
        if (job !== null && job !== undefined) {
            switch (job.data.type) {
                case Events.ChannelCreate: {
                    await channelCreateHandler(job.data.guildId, job.data.dataToStore)
                    break
                }
                case Events.ChannelUpdate: {
                    await channelUpdateHandler(job.data.guildId, job.data.dataToStore)
                    break
                }
                case Events.ChannelDelete: {
                    await channelDeleteHandler(job.data.guildId, job.data.channelId)
                    break
                }
                case Events.GuildMemberAdd: {
                    await guildMemberAddHandler(job.data.guildId, job.data.dataToStore)
                    break
                }
                case Events.GuildMemberUpdate: {
                    await guildMemberUpdateHandler(job.data.guildId, job.data.dataToStore)
                    break
                }
                case Events.GuildMemberRemove: {
                    await guildMemberRemoveHandler(job.data.guildId, job.data.guildMemberId)
                    break
                }
                case Events.GuildRoleCreate: {
                    await roleCreateHandler(job.data.guildId, job.data.dataToStore)
                    break
                }
                case Events.GuildRoleUpdate: {
                    await roleUpdateHandler(job.data.guildId, job.data.dataToStore)
                    break
                }
                case Events.GuildRoleDelete: {
                    await roleDeleteHandler(job.data.guildId, job.data.roleId)
                    break
                }
                case Events.UserUpdate: {
                    await userUpdateHandler(job.data.dataToStore)
                    break
                }
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
        concurrency: 10,
    }
)

WorkerFactory.attachEventListeners(discordEventWorker)
