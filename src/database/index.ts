import mongoose from 'mongoose';
import config from '../config';

// Connect to MongoDB
export async function connectDB() {
  mongoose.set('strictQuery', false);
  mongoose.connect(config.mongoose.serverURL).then(() => {
    console.log('Connected to MongoDB!');
  });
}
