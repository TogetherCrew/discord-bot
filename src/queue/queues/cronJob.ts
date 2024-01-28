import { QueueFactory } from './index';
import { cronJobConfig } from '../../config/queue';

export const cronJobQueue = QueueFactory.createQueue('cronJobQueue');

export const addCronJob = () => {
  cronJobQueue.add('cronJob', {}, { repeat: cronJobConfig } as never);
};
