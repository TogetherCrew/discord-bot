import { Job, Worker } from 'bullmq'

import { redisConfig } from '../../config/queue'
import guildExtraction from '../../functions/guildExtraction'
import { WorkerFactory } from './index'

export const guildExtractionWorker = new Worker(
    'guildExtractionQueue',
    async (job: Job<any, any, string> | undefined) => {
        if (job !== null && job !== undefined) {
            await guildExtraction(job.data.platform)
        }
    },
    {
        connection: redisConfig,
        concurrency: 1,
    }
)

WorkerFactory.attachEventListeners(guildExtractionWorker)
