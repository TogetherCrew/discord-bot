import { Client, GatewayIntentBits } from 'discord.js';
import config from './config';
import * as Sentry from '@sentry/node';
import loadEvents from './functions/loadEvents';
import fetchMessages from './functions/fetchChannelMessages';

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
  fetchMessages(client, '1105752303820083221');
}

app();
