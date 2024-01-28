import { Snowflake } from 'discord.js';
import { QueueFactory } from './index';

export const channelMessageQueue = QueueFactory.createQueue('channelMessageQueue');

export const addChannelMessage = (discordId: Snowflake, message: string) => {
  channelMessageQueue.add('channelMessageQueue', { discordId, message });
};
