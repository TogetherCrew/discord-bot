import { IChannel } from '@togethercrew.dev/db';
import { Connection } from 'mongoose';

export const channel1: IChannel = {
    id: '987654321098765432',
    name: 'Channel 1',
    parent_id: null
};

export const channel2: IChannel = {
    id: '234567890123456789',
    name: 'Channel 2',
    parent_id: '987654321098765432'
};

export const channel3: IChannel = {
    id: '345678901234567890',
    name: 'Channel 3',
    parent_id: '987654321098765432'
};

export const insertChannels = async function <Type>(channels: Array<Type>, connection: Connection) {
    await connection.models.Channel.insertMany(channels.map((channel) => (channel)));
};