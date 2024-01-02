import { Snowflake } from 'discord.js';
import { QueueFactory } from './index';

export const channelMessageQueue = QueueFactory.createQueue('channelMessageQueue');

export const addSendChannelMessage = (discordId: Snowflake, message: string) => {
    channelMessageQueue.add('channelMessageQueue', { discordId, message });
};