import { WorkerFactory } from './index';
import { Worker, type Job } from 'bullmq';
import { redisConfig, rateLimitConfig } from '../../config/queue';
import { userService } from '../../services';

export const directMessageWorker = new Worker(
  'directMessageQueue',
  async (job: Job<any, any, string> | undefined) => {
    if (job !== null && job !== undefined) {
      await userService.sendDirectMessage(job.data.discordId, job.data.message);
    }
  },
  {
    connection: redisConfig,
    limiter: rateLimitConfig,
  },
);

WorkerFactory.attachEventListeners(directMessageWorker);
