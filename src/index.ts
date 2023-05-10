import { Client, Events, GatewayIntentBits } from 'discord.js'
import { connectDB } from './database'
import config from './config'
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.env,
  tracesSampleRate: 1.0,
})

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once(Events.ClientReady, async (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`)
  await connectDB()
})

client.login(config.discord.botToken)
