import { type Snowflake } from 'discord.js';
import { QueueFactory } from './index';
import { type ObjectId } from 'mongodb';

export const channelMessageQueue = QueueFactory.createQueue('channelMessageQueue');

export const addChannelMessage = (discordId: Snowflake, message: string, sagaId: ObjectId): void => {
  void channelMessageQueue.add('channelMessageQueue', { discordId, message, sagaId });
};
