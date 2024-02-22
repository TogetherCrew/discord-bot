import { type Snowflake } from 'discord.js';
import { QueueFactory } from './index';

export const directMessageQueue = QueueFactory.createQueue('directMessageQueue');

export const addDirectMessage = (discordId: Snowflake, info: object): void => {
  void directMessageQueue.add('directMessageQueue', { discordId, info });
};
