import { WorkerFactory } from './index';
import { Worker, Job } from 'bullmq';
import { redisConfig } from '../../config/queue';
import cronJob from '../../functions/cronJon';

export const cronWorker = new Worker(
  'cronJobQueue',
  async (job: Job<any, any, string> | undefined) => {
    if (job) {
      await cronJob();
    }
  },
  {
    connection: redisConfig,
    lockDuration: 79200000, // 22 hours
  },
);

WorkerFactory.attachEventListeners(cronWorker);
