import { Client, GatewayIntentBits } from 'discord.js';
import config from './config';
import * as Sentry from '@sentry/node';
import loadEvents from './functions/loadEvents';

Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.env,
  tracesSampleRate: 1.0,
})

const client = new Client({ intents: [GatewayIntentBits.Guilds] })
loadEvents(client);

client.login(config.discord.botToken);