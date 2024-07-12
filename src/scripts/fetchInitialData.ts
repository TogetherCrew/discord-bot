import 'dotenv/config';
import { platformService } from '../database/services';
import { connectToMongoDB } from '../database/connection';
import { DatabaseManager } from '@togethercrew.dev/db';
import { coreService } from '../services';
import parentLogger from '../config/logger';
import fetchMembers from '../functions/fetchMembers';
import fetchChannels from '../functions/fetchChannels';
import fetchRoles from '../functions/fetchRoles';
const logger = parentLogger.child({ module: `fetchInitialData` });

async function fetchInitialData(guildId: string): Promise<void> {
  try {
    await coreService.DiscordBotManager.initClient();
    await coreService.DiscordBotManager.LoginClient();
    const client = await coreService.DiscordBotManager.getClient();
    await connectToMongoDB();
    const connection = await DatabaseManager.getInstance().getTenantDb(guildId);
    const platformDoc = await platformService.getPlatform({ 'metadata.id': guildId });

    client.once('ready', () => {
      (async () => {
        if (platformDoc !== null) {
          await Promise.all([
            connection.models.GuildMember.deleteMany({}),
            connection.models.Channel.deleteMany({}),
            connection.models.Role.deleteMany({}),
          ]);
          await Promise.all([
            fetchMembers(connection, platformDoc),
            fetchChannels(connection, platformDoc),
            fetchRoles(connection, platformDoc),
          ]);
          logger.info('fetchInitialData is done');
        } else {
          logger.info('fetchInitialData failed: platformDoc is null');
        }
      })().catch((error) => {
        logger.error('Error occurred in ready event handler', error);
      });
    });
  } catch (error) {
    logger.error(`Failed to fetch ${guildId} initial data`, error);
  }
}

fetchInitialData('933959587462254612').catch((error) => {
  logger.error('Unhandled exception in fetching 933959587462254612 guild', error);
});
