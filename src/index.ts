import { Client, Events, GatewayIntentBits } from 'discord.js';
import { connectDB } from './database';
import conifg from './config';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    await connectDB();
});

client.login(conifg.discord.botToken);

