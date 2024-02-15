import { QueueFactory } from './index';

export const userEventQueue = QueueFactory.createQueue('userEventQueue');

export const addUserEventQueue = (args: object): void => {
  void userEventQueue.add('userEventQueue', args);
};
