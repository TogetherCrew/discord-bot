import { WorkerFactory } from './index';
import { Worker, type Job } from 'bullmq';
import { redisConfig, rateLimitConfig } from '../../config/queue';
import { channelService } from '../../services';

export const channelMessageWorker = new Worker(
  'channelMessageQueue',
  async (job: Job<any, any, string> | undefined) => {
    if (job !== null && job !== undefined) {
      await channelService.sendChannelMessage(job.data.discordId, job.data.message);
    }
  },
  {
    connection: redisConfig,
    limiter: rateLimitConfig,
  },
);

WorkerFactory.attachEventListeners(channelMessageWorker);
