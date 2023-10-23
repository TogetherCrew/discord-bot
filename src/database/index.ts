import mongoose from 'mongoose';
import config from '../config';
import logger from '../config/logger';

export async function connectDB() {
  mongoose.set('strictQuery', false);
  mongoose
    .connect(config.mongoose.serverURL)
    .then(() => {
      logger.info({ url: config.mongoose.serverURL }, 'Connected to MongoDB!');
    })
    .catch(error => logger.error({ url: config.mongoose.serverURL, error }, 'Failed to connect to MongoDB!'));
}
