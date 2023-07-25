import { Events, Client } from 'discord.js';
import { databaseService } from '@togethercrew.dev/db'
import { guildService } from '../../database/services';
import fetchMembers from '../../functions/fetchMembers';
import fetchChannels from '../../functions/fetchChannels';
import fetchRoles from '../../functions/fetchRoles';
import { closeConnection } from '../../database/connection';
import config from '../../config';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    console.log(`client READY event is running`)
    const guilds = await guildService.getGuilds({ isDisconnected: false });
    for (let i = 0; i < guilds.length; i++) {
      const connection = databaseService.connectionFactory(guilds[i].guildId, config.mongoose.dbURL);
      console.log(`client READY: fetch members is running for ${guilds[i].guildId}:${guilds[i].name}`)
      await fetchMembers(connection, client, guilds[i].guildId)
      console.log(`client READY: fetch members is Done ${guilds[i].guildId}:${guilds[i].name}`)

      console.log(`client READY: fetch roles is running for ${guilds[i].guildId}:${guilds[i].name}`)
      await fetchRoles(connection, client, guilds[i].guildId)
      console.log(`client READY: fetch roles is Done ${guilds[i].guildId}:${guilds[i].name}`)

      console.log(`client READY: fetch channels is running for ${guilds[i].guildId}:${guilds[i].name}`)
      await fetchChannels(connection, client, guilds[i].guildId)
      console.log(`client READY: fetch channels is Done ${guilds[i].guildId}:${guilds[i].name}`)
      await closeConnection(connection)
    }
  },
};