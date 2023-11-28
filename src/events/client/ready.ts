import { Events, Client } from 'discord.js';
import { guildService } from '../../database/services';
import fetchMembers from '../../functions/fetchMembers';
import fetchChannels from '../../functions/fetchChannels';
import fetchRoles from '../../functions/fetchRoles';
import DatabaseManager from '../../database/connection';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'ClientReady' });

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    logger.info('event is running');
    const guilds = await guildService.getGuilds({ isDisconnected: false });
    for (let i = 0; i < guilds.length; i++) {
      const connection = DatabaseManager.getInstance().getTenantDb(guilds[i].guildId);
      try {
        logger.info({ guild_id: guilds[i].guildId }, 'Fetching guild members, roles,and channels');
        await fetchMembers(connection, client, guilds[i].guildId);
        await fetchRoles(connection, client, guilds[i].guildId);
        await fetchChannels(connection, client, guilds[i].guildId);
        logger.info({ guild_id: guilds[i].guildId }, 'Fetching guild members, roles, channels is done');
      } catch (err) {
        logger.error({ guild_id: guilds[i].guildId, err }, 'Fetching guild members, roles,and channels failed');
        logger.info('event is done');
      }
    }
    logger.info('event is done');
  },
};