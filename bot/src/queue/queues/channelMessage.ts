import { type Snowflake } from 'discord.js';
import { QueueFactory } from './index';
import { type ObjectId } from 'mongodb';

export const channelMessageQueue = QueueFactory.createQueue('channelMessageQueue');

export const addChannelMessage = (discordId: Snowflake, message: string, sagaId: ObjectId): void => {
  void channelMessageQueue.add(
    'channelMessageQueue',
    { discordId, message, sagaId },
    {
      removeOnComplete: {
        age: 1 * 24 * 3600, // keep up to 1 day
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep up to 7 days
      },
    },
  );
};
