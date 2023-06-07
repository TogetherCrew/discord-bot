import { IDiscordGuild, databaseService } from "@togethercrew.dev/db";
import config from "./config";
import guildExtraction from "./functions/guildExtraction";
import { Client, GatewayIntentBits } from "discord.js";
import { guildService as _guildService } from "./database/services";
import { connectDB } from "./database";
import guildService from "./services/guild.service";
import { channel } from "diagnostics_channel";

const guildId = process.argv[2]

if (!guildId) {
  throw new Error("You need a guildId.");
}

console.log("guildId", guildId)

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences],
});

const main = async () => {

  await client.login(config.discord.botToken);
  await connectDB();


  let _guild = await _guildService.getGuild({ guildId })

  if (!_guild) {
    _guild = await _guildService.createGuild({ id: guildId, name: "unknown", icon: "unknown" } as IDiscordGuild, "0000")
  }

  const channels = await guildService.getGuildChannels(_guild.guildId)
  const selectedChannels = channels.map(((channel: { id: any; name: any; }) => ({ channelId: channel.id, channelName: channel.name })))
  // console.log(selectedChannels)
  const period = new Date("2022-05-01T00:00:00.000+00:00")
  _guild = await _guildService.updateGuild({ guildId }, { selectedChannels, period })
  
  const connection = await databaseService.connectionFactory(guildId, config.mongoose.dbURL);

  try {
    await guildExtraction(connection, client, guildId)
    console.log(`Finished extraction`, guildId)
    process.exit(1)
  } catch (e) {
    console.error(e)
    process.exit(0)
  }
}

main()