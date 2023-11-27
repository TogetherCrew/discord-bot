import { Events, Client } from 'discord.js';
import { platformService } from '../../database/services';
import fetchMembers from '../../functions/fetchMembers';
import fetchChannels from '../../functions/fetchChannels';
import fetchRoles from '../../functions/fetchRoles';
import { DatabaseManager } from '@togethercrew.dev/db';
import parentLogger from '../../config/logger';

console.log('FLAG')


const logger = parentLogger.child({ event: 'ClientReady' });

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    logger.info('event is running');
    const platforms = await platformService.getPlatforms({ disconnectedAt: null });
    for (let i = 0; i < platforms.length; i++) {
      const connection = DatabaseManager.getInstance().getTenantDb(platforms[i].metadata?.id);
      try {
        logger.info({ platform_id: platforms[i].id }, 'Fetching guild members, roles,and channels');
        await fetchMembers(connection, client, platforms[i].metadata?.id);
        await fetchRoles(connection, client, platforms[i].metadata?.id);
        await fetchChannels(connection, client, platforms[i].metadata?.id);
        logger.info({ platform_id: platforms[i].metadata?.id }, 'Fetching guild members, roles, channels is done');
      } catch (err) {
        logger.error({ platform_id: platforms[i].metadata?.id, err }, 'Fetching guild members, roles,and channels failed');
        logger.info('event is done');
      }
    }
    logger.info('event is done');
  },
};
