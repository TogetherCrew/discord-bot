import { WorkerFactory } from './index'
import { Worker, type Job } from 'bullmq'
import { redisConfig } from '../../config/queue'
import { userService } from '../../services'

export const directMessageWorker = new Worker(
    'directMessageQueue',
    async (job: Job<any, any, string> | undefined) => {
        if (job !== null && job !== undefined) {
            await userService.sendDirectMessage(job.data.discordId, job.data.info)
        }
    },
    {
        connection: redisConfig,
        concurrency: 100,
        limiter: {
            max: 100,
            duration: 10000,
        },
    }
)

WorkerFactory.attachEventListeners(directMessageWorker)
