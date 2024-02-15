import { QueueFactory } from './index';

export const discordEventQueue = QueueFactory.createQueue('discordEventQueue');

export const addDiscordEvent = (args: object): void => {
  void discordEventQueue.add('discordEventQueue', args);
};
