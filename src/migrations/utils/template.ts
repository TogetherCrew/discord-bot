import { connectDB } from '../../database';
import DatabaseManager from '../../database/connection';
import 'dotenv/config';

export const up = async () => {
    await connectDB();
    const connection = DatabaseManager.getInstance().getTenantDb("681946187490000803");
    await connection.createCollection('my_collection');
};

export const down = async () => {
    await connectDB()

};