import { QueueFactory } from './index';

export const guildEventQueue = QueueFactory.createQueue('guildEventQueue');

export const addGuildEventQueue = (args: object): void => {
  void guildEventQueue.add('guildEventQueue', args);
};
