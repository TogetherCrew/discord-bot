import { connectToMongoDB } from '../../database/connection';
import 'dotenv/config';
import { DatabaseManager } from '@togethercrew.dev/db';

export const up = async () => {
<<<<<<< HEAD
  await connectToMongoDB();
=======
  await connectDB();
>>>>>>> main
  const connection = await DatabaseManager.getInstance().getTenantDb("681946187490000803");

  await connection.createCollection('my_collection');
};

export const down = async () => {
  await connectToMongoDB();
};
