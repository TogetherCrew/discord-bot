import { WorkerFactory } from './index';
import { Worker, type Job } from 'bullmq';
import { redisConfig } from '../../config/queue';
import guildExtraction from '../../functions/guildExtraction';

export const guildExtractionWorker = new Worker(
  'guildExtractionQueue',
  async (job: Job<any, any, string> | undefined) => {
    if (job !== null && job !== undefined) {
      await guildExtraction(job.data.platform);
    }
  },
  {
    connection: redisConfig,
    concurrency: 1,
  },
);

WorkerFactory.attachEventListeners(guildExtractionWorker);
