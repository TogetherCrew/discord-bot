import { QueueFactory } from './index';
import { cronJobRepeatConfig } from '../../config/queue';

export const cronJobQueue = QueueFactory.createQueue('cronJobQueue');

export const addCronJob = (): void => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  void cronJobQueue.add('cronJob', {}, { repeat: cronJobRepeatConfig } as never);
};
