import { Events, Client } from 'discord.js';
import { databaseService } from '@togethercrew.dev/db'
import { guildService } from '../../database/services';
import fetchMembers from '../../functions/fetchMembers';
import config from '../../config';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    console.log(`client READY event is running`)
    const guilds = await guildService.getGuilds({ isDisconnected: false });
    for (let i = 0; i < guilds.length; i++) {
      console.log(`client READY event is running for ${guilds[i].guildId}:${guilds[i].name}`)
      const connection = databaseService.connectionFactory(guilds[i].guildId, config.mongoose.dbURL);
      await fetchMembers(connection, client, guilds[i].guildId)
      console.log(`client READY event is Done ${guilds[i].guildId}:${guilds[i].name}`)
    }
  },
};
