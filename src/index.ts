import { Channel, ChannelType, Snowflake, TextChannel } from 'discord.js';
import { HydratedDocument } from 'mongoose';
import { IPlatform } from '@togethercrew.dev/db'
import config from './config';
import * as Sentry from '@sentry/node';
import loadEvents from './functions/loadEvents';
import RabbitMQ, { Event, MBConnection, Queue as RabbitMQQueue } from '@togethercrew.dev/tc-messagebroker';
// import './rabbitmqEvents' // we need this import statement here to initialize RabbitMQ events
import { connectDB } from './database';
import { DatabaseManager } from '@togethercrew.dev/db';
import guildExtraction from './functions/guildExtraction';
import sendDirectMessage from './functions/sendDirectMessage';
import { createPrivateThreadAndSendMessage } from './functions/thread';
import fetchMembers from './functions/fetchMembers';
import fetchChannels from './functions/fetchChannels';
import fetchRoles from './functions/fetchRoles';
import parentLogger from './config/logger';
import { platformService } from './database/services';
import { DiscordBotManager } from './utils/discord';
import { addCronJob } from './queue/jobs/cronJob';
import './queue/workers/cronJob';

const logger = parentLogger.child({ module: 'App' });

Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.env,
  tracesSampleRate: 1.0,
});


const partial =
  (func: any, ...args: any) =>
    (...rest: any) =>
      func(...args, ...rest);

const fetchMethod = async (msg: any) => {

  logger.info({ msg }, 'fetchMethod is running');
  if (!msg) return;
  const { content } = msg;
  const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });
  logger.info({ saga: saga.data }, 'the saga info');
  const platformId = saga.data['platformId'];
  const platform = await platformService.getPlatform({ _id: platformId });

  if (platform) {
    const isPlatformCreated = saga.data['created'];
    const connection = DatabaseManager.getInstance().getTenantDb(platform.metadata?.id);
    if (isPlatformCreated) {
      await fetchChannels(connection, platform);
      await fetchMembers(connection, platform);
      await fetchRoles(connection, platform);
    } else {
      await guildExtraction(connection, platform);
    }
  }
  logger.info({ msg }, 'fetchMethod is done');
};

const notifyUserAboutAnalysisFinish = async (
  discordId: string,
  info: { guildId: Snowflake; message: string; useFallback: boolean }
) => {
  const client = await DiscordBotManager.getClient();

  // related issue https://github.com/RnDAO/tc-discordBot/issues/68
  const { guildId, message, useFallback } = info;

  const guild = await client.guilds.fetch(guildId);
  const channels = await guild.channels.fetch();

  const arrayChannels = Array.from(channels, ([name, value]) => ({ ...value } as Channel));
  const textChannels = arrayChannels.filter(channel => channel.type == ChannelType.GuildText) as TextChannel[];
  const rawPositionBasedSortedTextChannels = textChannels.sort((textChannelA, textChannelB) =>
    textChannelA.rawPosition > textChannelB.rawPosition ? 1 : -1
  );
  const upperTextChannel = rawPositionBasedSortedTextChannels[0];

  try {
    sendDirectMessage({ discordId, message });
  } catch (error) {
    // can not send DM to the user
    // Will create a private thread and notify him/her about the status if useFallback is true
    if (useFallback)
      createPrivateThreadAndSendMessage(upperTextChannel, {
        threadName: 'TogetherCrew Status',
        message: `<@${discordId}> ${message}`,
      });
  }
};

const fetchInitialData = async (platform: HydratedDocument<IPlatform>) => {
  try {
    const connection = DatabaseManager.getInstance().getTenantDb(platform.metadata?.id);
    await fetchChannels(connection, platform);
    await fetchRoles(connection, platform);
    await fetchMembers(connection, platform);
  } catch (error) {
    logger.error({ error }, 'fetchInitialData is failed');
  }
};

// APP
async function app() {
  await loadEvents();
  await DiscordBotManager.LoginClient();
  await connectDB();
  addCronJob();

  try {
    await MBConnection.connect(config.mongoose.dbURL);
  } catch (error) {
    logger.fatal({ url: config.mongoose.dbURL, error }, 'Failed to connect to MongoDB!');
  }
  await RabbitMQ.connect(config.rabbitMQ.url, RabbitMQQueue.DISCORD_BOT)
    .then(() => {
      logger.info({ url: config.rabbitMQ.url, queue: RabbitMQQueue.DISCORD_BOT }, 'Connected to RabbitMQ!');
    })
    .catch(error =>
      logger.fatal(
        { url: config.rabbitMQ.url, queue: RabbitMQQueue.DISCORD_BOT, error },
        'Failed to connect to RabbitMQ!'
      )
    );

  RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH, async msg => {
    try {
      logger.info({ msg, event: Event.DISCORD_BOT.FETCH }, 'is running');
      if (!msg) return;

      const { content } = msg;
      const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });

      const fn = partial(fetchMethod, msg);
      await saga.next(fn);
      logger.info({ msg, event: Event.DISCORD_BOT.FETCH }, 'is done');
    } catch (error) {
      logger.error({ msg, event: Event.DISCORD_BOT.FETCH_MEMBERS, error }, 'is failed');

    }
  });

  RabbitMQ.onEvent(Event.DISCORD_BOT.SEND_MESSAGE, async msg => {
    logger.info({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE }, 'is running');
    if (!msg) return;

    const { content } = msg;
    const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });

    const platformId = saga.data['platformId'];
    const platform = await platformService.getPlatform({ _id: platformId }); const discordId = saga.data['discordId'];
    const message = saga.data['message'];
    const useFallback = saga.data['useFallback'];

    if (platform) {
      const fn = notifyUserAboutAnalysisFinish.bind({}, discordId, { guildId: platform.metadata?.id, message, useFallback });
      await saga.next(fn);
    }

    logger.info({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE }, 'is done');
  });

  RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH_MEMBERS, async msg => {
    try {
      logger.info({ msg, event: Event.DISCORD_BOT.FETCH_MEMBERS }, 'is running');
      if (!msg) return;

      const { content } = msg;
      const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });

      const platformId = saga.data['platformId'];

      const platform = await platformService.getPlatform({ _id: platformId });

      if (platform) {
        const fn = fetchInitialData.bind({}, platform);
        await saga.next(fn);
      }
      logger.info({ msg, event: Event.DISCORD_BOT.FETCH_MEMBERS }, 'is done');
    } catch (error) {
      logger.error({ msg, event: Event.DISCORD_BOT.FETCH_MEMBERS, error }, 'is failed');
    }

  });

}
app();
