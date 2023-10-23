"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = __importDefault(require("./config"));
const Sentry = __importStar(require("@sentry/node"));
const loadEvents_1 = __importDefault(require("./functions/loaders//loadEvents"));
const loadCommands_1 = __importDefault(require("./functions/loaders/loadCommands"));
const tc_messagebroker_1 = __importStar(require("@togethercrew.dev/tc-messagebroker"));
// import './rabbitmqEvents' // we need this import statement here to initialize RabbitMQ events
const database_1 = require("./database");
const db_1 = require("@togethercrew.dev/db");
const guildExtraction_1 = __importDefault(require("./functions/fetchData//guildExtraction"));
const sendDirectMessage_1 = __importDefault(require("./functions/sendDirectMessage"));
const thread_1 = require("./functions/thread");
const fetchMembers_1 = __importDefault(require("./functions/fetchData/fetchMembers"));
const fetchChannels_1 = __importDefault(require("./functions/fetchData/fetchChannels"));
const fetchRoles_1 = __importDefault(require("./functions/fetchData/fetchRoles"));
const connection_1 = require("./database/connection");
const logger_1 = __importDefault(require("./config/logger"));
const logger = logger_1.default.child({ module: 'App' });
Sentry.init({
    dsn: config_1.default.sentry.dsn,
    environment: config_1.default.sentry.env,
    tracesSampleRate: 1.0,
});
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildPresences,
        discord_js_1.GatewayIntentBits.DirectMessages,
    ],
});
const partial = (func, ...args) => (...rest) => func(...args, ...rest);
const fetchMethod = async (msg) => {
    logger.info({ msg }, 'fetchMethod is running');
    if (!msg)
        return;
    const { content } = msg;
    const saga = await tc_messagebroker_1.MBConnection.models.Saga.findOne({ sagaId: content.uuid });
    logger.info({ saga: saga.data }, 'the saga info');
    const guildId = saga.data['guildId'];
    const isGuildCreated = saga.data['created'];
    const connection = await db_1.databaseService.connectionFactory(guildId, config_1.default.mongoose.dbURL);
    if (isGuildCreated) {
        await (0, fetchMembers_1.default)(connection, client, guildId);
        await (0, fetchRoles_1.default)(connection, client, guildId);
        await (0, fetchChannels_1.default)(connection, client, guildId);
    }
    else {
        await (0, guildExtraction_1.default)(connection, client, guildId);
    }
    await (0, connection_1.closeConnection)(connection);
    logger.info({ msg }, 'fetchMethod is done');
};
const notifyUserAboutAnalysisFinish = async (discordId, info) => {
    // related issue https://github.com/RnDAO/tc-discordBot/issues/68
    const { guildId, message, useFallback } = info;
    const guild = await client.guilds.fetch(guildId);
    const channels = await guild.channels.fetch();
    const arrayChannels = Array.from(channels, ([name, value]) => (Object.assign({}, value)));
    const textChannels = arrayChannels.filter(channel => channel.type == discord_js_1.ChannelType.GuildText);
    const rawPositionBasedSortedTextChannels = textChannels.sort((textChannelA, textChannelB) => textChannelA.rawPosition > textChannelB.rawPosition ? 1 : -1);
    const upperTextChannel = rawPositionBasedSortedTextChannels[0];
    try {
        (0, sendDirectMessage_1.default)(client, { discordId, message });
    }
    catch (error) {
        // can not send DM to the user
        // Will create a private thread and notify him/her about the status if useFallback is true
        if (useFallback)
            (0, thread_1.createPrivateThreadAndSendMessage)(upperTextChannel, {
                threadName: 'TogetherCrew Status',
                message: `<@${discordId}> ${message}`,
            });
    }
};
const fetchInitialData = async (guildId) => {
    const connection = await db_1.databaseService.connectionFactory(guildId, config_1.default.mongoose.dbURL);
    await (0, fetchRoles_1.default)(connection, client, guildId);
    await (0, fetchChannels_1.default)(connection, client, guildId);
    await (0, fetchMembers_1.default)(connection, client, guildId);
    await (0, connection_1.closeConnection)(connection);
};
// APP
async function app() {
    await (0, loadEvents_1.default)(client);
    await (0, loadCommands_1.default)(client);
    await client.login(config_1.default.discord.botToken);
    await (0, database_1.connectDB)();
    await registerCommand();
    // await edit()
    // *****************************RABBITMQ
    try {
        await tc_messagebroker_1.MBConnection.connect(config_1.default.mongoose.dbURL);
    }
    catch (error) {
        logger.fatal({ url: config_1.default.mongoose.dbURL, error }, 'Failed to connect to MongoDB!');
    }
    await tc_messagebroker_1.default.connect(config_1.default.rabbitMQ.url, tc_messagebroker_1.Queue.DISCORD_BOT)
        .then(() => {
        logger.info({ url: config_1.default.rabbitMQ.url, queue: tc_messagebroker_1.Queue.DISCORD_BOT }, 'Connected to RabbitMQ!');
    })
        .catch(error => logger.fatal({ url: config_1.default.rabbitMQ.url, queue: tc_messagebroker_1.Queue.DISCORD_BOT, error }, 'Failed to connect to RabbitMQ!'));
    tc_messagebroker_1.default.onEvent(tc_messagebroker_1.Event.DISCORD_BOT.FETCH, async (msg) => {
        logger.info({ msg, event: tc_messagebroker_1.Event.DISCORD_BOT.FETCH }, 'is running');
        if (!msg)
            return;
        const { content } = msg;
        const saga = await tc_messagebroker_1.MBConnection.models.Saga.findOne({ sagaId: content.uuid });
        const fn = partial(fetchMethod, msg);
        await saga.next(fn);
        logger.info({ msg, event: tc_messagebroker_1.Event.DISCORD_BOT.FETCH }, 'is done');
    });
    tc_messagebroker_1.default.onEvent(tc_messagebroker_1.Event.DISCORD_BOT.SEND_MESSAGE, async (msg) => {
        logger.info({ msg, event: tc_messagebroker_1.Event.DISCORD_BOT.SEND_MESSAGE }, 'is running');
        if (!msg)
            return;
        const { content } = msg;
        const saga = await tc_messagebroker_1.MBConnection.models.Saga.findOne({ sagaId: content.uuid });
        const guildId = saga.data['guildId'];
        const discordId = saga.data['discordId'];
        const message = saga.data['message'];
        const useFallback = saga.data['useFallback'];
        const fn = notifyUserAboutAnalysisFinish.bind({}, discordId, { guildId, message, useFallback });
        await saga.next(fn);
        logger.info({ msg, event: tc_messagebroker_1.Event.DISCORD_BOT.SEND_MESSAGE }, 'is done');
    });
    tc_messagebroker_1.default.onEvent(tc_messagebroker_1.Event.DISCORD_BOT.FETCH_MEMBERS, async (msg) => {
        logger.info({ msg, event: tc_messagebroker_1.Event.DISCORD_BOT.FETCH_MEMBERS }, 'is running');
        if (!msg)
            return;
        const { content } = msg;
        const saga = await tc_messagebroker_1.MBConnection.models.Saga.findOne({ sagaId: content.uuid });
        const guildId = saga.data['guildId'];
        const fn = fetchInitialData.bind({}, guildId);
        await saga.next(fn);
        logger.info({ msg, event: tc_messagebroker_1.Event.DISCORD_BOT.FETCH_MEMBERS }, 'is done');
    });
    // *****************************BULLMQ
    // Create a queue instance with the Redis connection
    // const queue = new Queue('cronJobQueue', {
    //   connection: {
    //     host: config.redis.host,
    //     port: config.redis.port,
    //     password: config.redis.password,
    //   },
    // });
    // queue.add('cronJob', {}, {
    //   repeat: {
    //     cron: '0 0 * * *', // Run once 00:00 UTC
    //     // cron: '* * * * *', // Run every minute
    //     // every: 10000
    //   },
    //   jobId: 'cronJob', // Optional: Provide a unique ID for the job
    //   attempts: 1, // Number of times to retry the job if it fails
    //   backoff: {
    //     type: 'exponential',
    //     delay: 1000, // Initial delay between retries in milliseconds
    //   },
    // } as never);
    // // Create a worker to process the job
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const worker = new Worker(
    //   'cronJobQueue',
    //   async (job: Job<any, any, string> | undefined) => {
    //     if (job) {
    //       // Call the extractMessagesDaily function
    //       await cronJob(client);
    //     }
    //   },
    //   {
    //     connection: {
    //       host: config.redis.host,
    //       port: config.redis.port,
    //       password: config.redis.password,
    //     },
    //   }
    // );
    // // Listen for completed and failed events to log the job status
    // worker.on('completed', job => {
    //   logger.info({ job }, 'Job is done');
    // });
    // worker.on('failed', (job, error) => {
    //   logger.error({ job, error }, 'Job failed');
    // });
}
async function registerCommand() {
    try {
        console.log('*******');
        console.log({ commands: client.commands });
        console.log('*******');
        const rest = new discord_js_1.REST().setToken(config_1.default.discord.botToken);
        const commandData = [...client.commands.values()].map(command => command.data.toJSON());
        const data = await rest.put(discord_js_1.Routes.applicationGuildCommands(config_1.default.discord.clientId, "980858613587382322"), { body: commandData });
    }
    catch (err) {
        console.log(err);
    }
}
async function edit() {
    // const webHook = new WebhookClient({ id: "1157286743582720000", token: "aW50ZXJhY3Rpb246MTE1NzI4Njc0MzU4MjcyMDAwMDpJaEVEaFZiOUR6MjVhNjhacnFGdWptbUY1SXNRcUdSUEVPZkJLeHpmVlo0dnVCb1h5ajVXTkdFakFDZHNqUnowQzY0Q2MyZ1V1ekl0VDNXazA2S1pGVzFFSjB0RVNDQVFBSTgzMjdsT2FZMzJqNzl2SVgzaFFCdDZObkhCa1IyMg" });
    // webHook.editMessage('@original', new MessagePayload(webHook, { content: 'Edited Message!' }));
    try {
        // Create a new WebhookClient using the interaction's id and token.
        const webHook = new discord_js_1.WebhookClient({ id: "1130918826234617968", token: "aW50ZXJhY3Rpb246MTE1ODY4MDUyNzY4Mzk4OTU1NDpCeGNnejVobVl0bTN1eDU0b2o3U2ZOZ3FCb2lvTjYxZ1pQVXJZcmsxMEVYYmVadEJYMHpGbVBUSTdvQ1VaalNrUDltZUUwV0NzN0xMaWtobG14cTc3MUk4djJPandHbnpBSHNPR3RXa1JVcDRXVTc4UlloeEVIQzBPbFRtTnVLdw" });
        // Edit the original message using the WebhookClient.
        webHook.editMessage('@original', { content: 'Edited Message!' });
        webHook.send({ content: 'Follow UP Message!' });
    }
    catch (err) {
        console.log(err);
    }
}
app();
