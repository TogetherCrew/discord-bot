import { Client, GatewayIntentBits } from 'discord.js';
import config from './config';
import * as Sentry from '@sentry/node';
import loadEvents from './functions/loadEvents';
import guildExtraction from './functions/guildExtraction';

Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.env,
  tracesSampleRate: 1.0,
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

async function app() {
  await loadEvents(client);
  await client.login(config.discord.botToken);
  guildExtraction(client, '980858613587382322');
}

app();
