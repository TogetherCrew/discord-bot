import { Snowflake } from 'discord.js';
import { QueueFactory } from './index';

export const sendChannelMessageQueue = QueueFactory.createQueue('sendChannelMessageQueue');

export const addSendChannelMessage = (discordId: Snowflake, message: string) => {
    sendChannelMessageQueue.add('sendChannelMessage', { discordId, message });
};