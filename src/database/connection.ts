import mongoose from 'mongoose';
import config from '../config';
import { MBConnection } from '@togethercrew.dev/tc-messagebroker';
import logger from '../config/logger';

mongoose.set('strictQuery', true);

// Connect to Message Broker DB
export const connectToMB = async (): Promise<void> => {
  try {
    MBConnection.connect(config.mongoose.dbURL);
    logger.info('Setuped Message Broker connection!');
  } catch (error) {
    logger.fatal('Failed to setup to Message Broker!!');
  }
};

// Connect to MongoDB
export const connectToMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoose.serverURL);
    logger.info('Connected to MongoDB!');
  } catch (error) {
    logger.fatal('Failed to connect to MongoDB!');
  }
};
