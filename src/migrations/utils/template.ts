import { connectDB } from '../../database';
import { databaseService } from '@togethercrew.dev/db';
import 'dotenv/config';
import config from '../../config';

export const up = async () => {
  await connectDB();
  const connection = databaseService.connectionFactory('681946187490000803', config.mongoose.dbURL);
  await connection.createCollection('my_collection');
};

export const down = async () => {
  await connectDB();
};
