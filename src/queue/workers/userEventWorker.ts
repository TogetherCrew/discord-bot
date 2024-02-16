import { WorkerFactory } from './index';
import { Worker, type Job } from 'bullmq';
import { redisConfig } from '../../config/queue';
import { Events } from 'discord.js';
import { userUpdateHandler } from '../handlers';

export const discordEventWorker = new Worker(
  'userEventQueue',
  async (job: Job<any, any, string> | undefined) => {
    if (job !== null && job !== undefined) {
      switch (job.data.type) {
        case Events.UserUpdate: {
          await userUpdateHandler(job.data.dataToStore);
          break;
        }
      }
    }
  },
  {
    connection: redisConfig,
    concurrency: 1
  },
);

WorkerFactory.attachEventListeners(discordEventWorker);
