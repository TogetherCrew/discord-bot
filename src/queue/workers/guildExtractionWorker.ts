import { WorkerFactory } from './index';
import { Worker, type Job } from 'bullmq';
import { redisConfig, guildExtractionConfig } from '../../config/queue';
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
    limiter: guildExtractionConfig,
  },
);

WorkerFactory.attachEventListeners(guildExtractionWorker);
