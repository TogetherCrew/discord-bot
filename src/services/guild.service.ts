import { Snowflake } from "discord.js";
import config from "../config";

async function getGuildChannels(guildId: Snowflake) {
  try {
      const response = await fetch(`https://discord.com/api/guilds/${guildId}/channels?`, {
          method: 'GET',
          headers: { 'Authorization': `Bot ${config.discord.botToken}` }
      });
      const channels = await response.json();
      // Note: {message: '401: Unauthorized', code:0} means that we have not access to guild channels
      if (channels.message) {
          throw new Error();
      }
      return channels;
  } catch (err) {
      throw new Error('Can not fetch from discord API');
  }
}

export default {
  getGuildChannels
}