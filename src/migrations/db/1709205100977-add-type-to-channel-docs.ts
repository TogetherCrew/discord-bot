import 'dotenv/config';
import { platformService } from '../../database/services';
import { connectToMongoDB } from '../../database/connection';
import addChannelTypeLogic from '../utils/addChannelTypeLogic';
import { DatabaseManager } from '@togethercrew.dev/db';
import { coreService } from '../../services';

export const up = async (): Promise<void> => {
  await coreService.DiscordBotManager.initClient();
  await coreService.DiscordBotManager.LoginClient();
  const client = await coreService.DiscordBotManager.getClient();
  await connectToMongoDB();
  const platforms = await platformService.getPlatforms({});
  for (let i = 0; i < platforms.length; i++) {
    const connection = await DatabaseManager.getInstance().getTenantDb(platforms[i].metadata?.id);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    if (client.isReady()) {
      await addChannelTypeLogic(connection, platforms[i].metadata?.id);
    }
  }
};
export const down = async (): Promise<void> => {
  await connectToMongoDB();
};
