import { WorkerFactory } from './index'
import { Worker, type Job } from 'bullmq'
import { redisConfig } from '../../config/queue'
import { channelService } from '../../services'
import { MBConnection } from '@togethercrew.dev/tc-messagebroker'

export const channelMessageWorker = new Worker(
    'channelMessageQueue',
    async (job: Job<any, any, string> | undefined) => {
        if (job !== null && job !== undefined) {
            const saga = await MBConnection.models.Saga.findOne({
                sagaId: job.data.sagaId,
            })

            const message = await channelService.sendChannelMessage(
                job.data.discordId,
                job.data.message
            )
            if (saga.data.isSafetyMessage === true) {
                saga.data = {
                    ...saga.data,
                    safetyMessageReference: {
                        guildId: message?.guildId,
                        channelId: message?.channelId,
                        messageId: message?.id,
                    },
                }
                await saga.next(async () => {
                    if (saga.data.isSafetyMessage === true) {
                        await saga.save()
                    }
                })
            }
        }
    },
    {
        connection: redisConfig,
        concurrency: 20,
        limiter: {
            max: 20,
            duration: 10000,
        },
    }
)

WorkerFactory.attachEventListeners(channelMessageWorker)
