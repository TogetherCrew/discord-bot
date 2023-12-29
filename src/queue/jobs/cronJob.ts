import { Queue } from 'bullmq';
import { redisConfig, cronJobConfig } from '../../config/queue';

export const cronJobQueue = new Queue('cronJobQueue', { connection: redisConfig });

export const addCronJob = () => {
    cronJobQueue.add('cronJob', {}, { repeat: cronJobConfig } as never);
};