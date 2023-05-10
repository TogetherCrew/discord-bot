import { Client, Events, GatewayIntentBits } from 'discord.js';
import conifg from './config';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(conifg.discord.botToken);

