import { Snowflake } from 'discord.js';
import { QueueFactory } from './index';

export const directMessageQueue = QueueFactory.createQueue('directMessageQueue');

export const addDirectMessage = (discordId: Snowflake, message: string) => {
  directMessageQueue.add('directMessageQueue', { discordId, message });
};
