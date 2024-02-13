import { connectToMongoDB } from '../../database/connection';
import 'dotenv/config';
import { DatabaseManager } from '@togethercrew.dev/db';

export const up = async (): Promise<void> => {
  await connectToMongoDB();
  const connection = await DatabaseManager.getInstance().getTenantDb('681946187490000803');

  await connection.createCollection('my_collection');
};

export const down = async (): Promise<void> => {
  await connectToMongoDB();
};
