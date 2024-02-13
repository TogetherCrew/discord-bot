import { QueueFactory } from './index';
import { type HydratedDocument } from 'mongoose';
import { type IPlatform } from '@togethercrew.dev/db';

export const discordEventQueue = QueueFactory.createQueue('guildExtractionQueue');

export const addGuildExtraction = (platform: HydratedDocument<IPlatform>): void => {
  void discordEventQueue.add('guildExtractionQueue', { platform });
};
