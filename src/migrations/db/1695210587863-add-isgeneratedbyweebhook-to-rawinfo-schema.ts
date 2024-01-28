import 'dotenv/config';
import { platformService } from '../../database/services';
import { connectToMongoDB } from '../../database/connection';
import webhookLogic from '../utils/webhookLogic';
import { DatabaseManager } from '@togethercrew.dev/db';

export const up = async () => {
  await connectToMongoDB();
  const platforms = await platformService.getPlatforms({});
  for (let i = 0; i < platforms.length; i++) {
    const connection = await DatabaseManager.getInstance().getTenantDb(platforms[i].metadata?.id);
    await webhookLogic(connection, platforms[i].metadata?.id);
  }
};

export const down = async () => {
  // TODO: Implement rollback logic if needed
};
