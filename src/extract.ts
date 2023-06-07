import { IDiscordGuild, databaseService } from "@togethercrew.dev/db";
import config from "./config";
import guildExtraction from "./functions/guildExtraction";
import { Client, GatewayIntentBits } from "discord.js";
import { guildService } from "./database/services";
import { connectDB } from "./database";

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
  
  try {
    await guildService.createGuild({ id: guildId, name: "unknown", icon: "unknown" } as IDiscordGuild, "0000")
    console.log("Created guild", guildId)
  } catch (e) {
    console.log("Guild exists:", guildId)
  }
  
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