import { IChannel } from '@togethercrew.dev/db';
import { Connection } from 'mongoose';

export const channel1: IChannel = {
    channelId: '987654321098765432',
    name: 'Channel 1',
    parentId: null
};

export const channel2: IChannel = {
    channelId: '234567890123456789',
    name: 'Channel 2',
    parentId: '987654321098765432'
};

export const channel3: IChannel = {
    channelId: '345678901234567890',
    name: 'Channel 3',
    parentId: '987654321098765432'
};

export const insertChannels = async function <Type>(channels: Array<Type>, connection: Connection) {
    await connection.models.Channel.insertMany(channels.map((channel) => (channel)));
};