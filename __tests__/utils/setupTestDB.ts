import mongoose from 'mongoose';
import config from '../../src/config';

const setupTestDB = () => {
  beforeAll(async () => {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongoose.serverURL);
  });

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany({})),
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};

export default setupTestDB;
