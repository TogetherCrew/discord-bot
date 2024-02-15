import { QueueFactory } from './index';
import { type HydratedDocument } from 'mongoose';
import { type IPlatform } from '@togethercrew.dev/db';

export const guildExtractionQueue = QueueFactory.createQueue('guildExtractionQueue');

export const addGuildExtraction = (platform: HydratedDocument<IPlatform>): void => {
  void guildExtractionQueue.add('guildExtractionQueue', { platform });
};
