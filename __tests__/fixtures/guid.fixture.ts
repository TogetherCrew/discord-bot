import { Types } from 'mongoose';
import { Guild } from '@togethercrew.dev/db';

export const guild1 = {
  guildId: '123456789',
  user: '987654321',
  name: 'Guild 1',
  _id: new Types.ObjectId(),
  selectedChannels: [
    {
      channelId: '111111111',
      channelName: 'Channel 1',
    },
  ],
  period: new Date(),
  connectedAt: new Date(),
  isDisconnected: false,
  isInProgress: true,
  icon: 'guild1.png',
  window: [1, 2], // Update to have 2 numbers
  action: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], // Update to have 11 numbers
};

export const guild2 = {
  guildId: '987654321',
  user: '987654321',
  name: 'Guild 2',
  _id: new Types.ObjectId(),
  selectedChannels: [
    {
      channelId: '333333333',
      channelName: 'Channel 3',
    },
  ],
  connectedAt: new Date(),
  isDisconnected: true,
  isInProgress: false,
  icon: null,
  window: [7, 8], // Update to have 2 numbers
  action: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], // Update to have 11 numbers
};

export const guild3 = {
  guildId: '567890123',
  user: '098765432',
  name: 'Guild 3',
  _id: new Types.ObjectId(),
  selectedChannels: [
    {
      channelId: '555555555',
      channelName: 'Channel 5',
    },
  ],
  connectedAt: new Date(),
  isDisconnected: false,
  isInProgress: true,
  icon: 'guild3.png',
};

export const insertManyGuilds = async function <Type>(guilds: Array<Type>) {
  await Guild.insertMany(guilds.map((guild) => guild));
};
