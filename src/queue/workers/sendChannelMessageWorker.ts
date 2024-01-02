import { WorkerFactory } from './index';
import { Worker, Job } from 'bullmq';
import { redisConfig, rateLimitConfig } from '../../config/queue';
import { channelService } from '../../services';

export const sendChannelMessageWorker = new Worker(
    'sendChannelMessageQueue',
    async (job: Job<any, any, string> | undefined) => {
        if (job) {
            await channelService.sendChannelMessage(job.data.discordId, job.data.message);
        }
    },
    {
        connection: redisConfig,
        limiter: rateLimitConfig
    }
);

WorkerFactory.attachEventListeners(sendChannelMessageWorker)
