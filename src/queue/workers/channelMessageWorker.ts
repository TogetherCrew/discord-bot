import { WorkerFactory } from './index';
import { Worker, type Job } from 'bullmq';
import { redisConfig } from '../../config/queue';
import { channelService } from '../../services';
import { MBConnection } from '@togethercrew.dev/tc-messagebroker';
import parentLogger from '../../config/logger';
const logger = parentLogger.child({ module: 'channelMessageWorker' });

export const channelMessageWorker = new Worker(
  'channelMessageQueue',
  async (job: Job<any, any, string> | undefined) => {
    if (job !== null && job !== undefined) {
      const message = await channelService.sendChannelMessage(job.data.discordId, job.data.message);
      const saga = await MBConnection.models.Saga.findOne({
        sagaId: job.data.sagaId,
      });
      if (saga.data.isSafetyMessage === true) {
        saga.data = {
          ...saga.data,
          safetyMessageReference: {
            guildId: message?.guildId,
            channelId: message?.channelId,
            messageId: message?.id,
          },
        };
      }
      logger.info('channelMessageWorker-11', saga);
      await saga.save();
      logger.info('channelMessageWorker-22', saga);

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
