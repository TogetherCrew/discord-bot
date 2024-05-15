import { QueueFactory } from './index';

export const guildEventQueue = QueueFactory.createQueue('guildEventQueue');

export const addGuildEventQueue = (args: object): void => {
  void guildEventQueue.add('guildEventQueue', args, {
    removeOnComplete: {
      age: 3 * 3600, // keep up to 3 hours
      count: 6000, // keep up to 6000 jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // keep up to 7 days
    },
  });
};
