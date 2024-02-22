import { WorkerFactory } from './index';
import { Worker, type Job } from 'bullmq';
import { redisConfig } from '../../config/queue';
import { channelService } from '../../services';

export const channelMessageWorker = new Worker(
  'channelMessageQueue',
  async (job: Job<any, any, string> | undefined) => {
    if (job !== null && job !== undefined) {
      const message = await channelService.sendChannelMessage(job.data.discordId, job.data.message);
      if (job.data.saga.data.isSafteyMessage === true) {
        job.data.saga.data = {
          ...job.data.saga.data,
          reference:{
            guildId: message?.guildId,
            channelId: message?.channelId,
            messageId: message?.id
          }
        }
      }
      job.data.saga.next()
    }
  },
  {
    connection: redisConfig,
    concurrency: 20,
    limiter: {
      max: 20,
      duration: 10000,
    },
  },
);

WorkerFactory.attachEventListeners(channelMessageWorker);
