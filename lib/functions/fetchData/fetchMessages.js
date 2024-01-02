"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const services_1 = require("../../database/services");
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ module: 'FetchMessages' });
/**
 * Fetches reaction details from a message.
 * @param {Message} message - The message object from which reactions are to be fetched.
 * @returns {Promise<string[]>} - A promise that resolves to an array of strings where each string is a comma-separated list of user IDs who reacted followed by the reaction emoji.
 */
async function getReactions(message) {
    try {
        const reactions = message.reactions.cache;
        const reactionsArray = [...reactions.values()];
        const reactionsArr = [];
        for (const reaction of reactionsArray) {
            const emoji = reaction.emoji;
            const users = await reaction.users.fetch();
            let usersString = users.map(user => `${user.id}`).join(',');
            usersString += `,${emoji.name}`;
            reactionsArr.push(usersString);
        }
        return reactionsArr;
    }
    catch (err) {
        logger.error({ message, err }, 'Faild to get reactions');
        return [];
    }
}
/**
 * Extracts necessary data from a given message.
 * @param {Message} message - The message object from which data is to be extracted.
 * @param {threadInfo} threadInfo - An optional thread info object containing details about the thread the message is part of.
 * @returns {Promise<IRawInfo>} - A promise that resolves to an object of type IRawInfo containing the extracted data.
 */
async function getNeedDataFromMessage(message, threadInfo) {
    var _a, _b;
    if (threadInfo) {
        return {
            type: message.type,
            author: message.author.id,
            content: message.content,
            createdDate: message.createdAt,
            role_mentions: message.mentions.roles.map((role) => role.id),
            user_mentions: message.mentions.users.map((user) => user.id),
            replied_user: message.type === 19 ? (_a = message.mentions.repliedUser) === null || _a === void 0 ? void 0 : _a.id : null,
            reactions: await getReactions(message),
            messageId: message.id,
            channelId: (threadInfo === null || threadInfo === void 0 ? void 0 : threadInfo.channelId) ? threadInfo === null || threadInfo === void 0 ? void 0 : threadInfo.channelId : '',
            channelName: (threadInfo === null || threadInfo === void 0 ? void 0 : threadInfo.channelName) ? threadInfo === null || threadInfo === void 0 ? void 0 : threadInfo.channelName : '',
            threadId: (threadInfo === null || threadInfo === void 0 ? void 0 : threadInfo.threadId) ? threadInfo === null || threadInfo === void 0 ? void 0 : threadInfo.threadId : null,
            threadName: (threadInfo === null || threadInfo === void 0 ? void 0 : threadInfo.threadName) ? threadInfo === null || threadInfo === void 0 ? void 0 : threadInfo.threadName : null,
            isGeneratedByWebhook: message.webhookId ? true : false
        };
    }
    else {
        return {
            type: message.type,
            author: message.author.id,
            content: message.content,
            createdDate: message.createdAt,
            role_mentions: message.mentions.roles.map((role) => role.id),
            user_mentions: message.mentions.users.map((user) => user.id),
            replied_user: message.type === 19 ? (_b = message.mentions.repliedUser) === null || _b === void 0 ? void 0 : _b.id : null,
            reactions: await getReactions(message),
            messageId: message.id,
            channelId: message.channelId,
            channelName: message.channel instanceof discord_js_1.TextChannel ? message.channel.name : null,
            threadId: null,
            threadName: null,
            isGeneratedByWebhook: message.webhookId ? true : false
        };
    }
}
/**
 * Iterates over a list of messages and pushes extracted data from each message to an array.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo[]} arr - The array to which extracted data will be pushed.
 * @param {Message[]} messagesArray - An array of messages from which data is to be extracted.
 * @param {threadInfo} threadInfo - An optional thread info object containing details about the thread the messages are part of.
 * @returns {Promise<IRawInfo[]>} - A promise that resolves to the updated array containing the extracted data.
 */
async function pushMessagesToArray(connection, arr, messagesArray, threadInfo) {
    const allowedTypes = [0, 18, 19];
    for (const message of messagesArray) {
        if (message.type === 21) {
            // const res = await rawInfoService.updateRawInfo(connection, { messageId: message.id }, { threadId: threadInfo?.threadId, threadName: threadInfo?.threadName });
        }
        if (allowedTypes.includes(message.type)) {
            await arr.push(await getNeedDataFromMessage(message, threadInfo));
        }
    }
    return arr;
}
/**
 * Fetches a list of messages from a specified channel and stores their extracted data.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {TextChannel | ThreadChannel} channel - The channel from which messages are to be fetched.
 * @param {IRawInfo} rawInfo - An optional raw info object used for message fetching options.
 * @param {Date} period - A date object specifying the oldest date for the messages to be fetched.
 * @param {'before' | 'after'} fetchDirection - The direction of message fetching: 'before' fetches older messages and 'after' fetches newer messages.
 * @throws Will throw an error if an issue is encountered during processing.
 */
async function fetchMessages(connection, channel, rawInfo = undefined, period, fetchDirection = 'before') {
    var _a, _b, _c, _d;
    try {
        logger.info({ guild_id: connection.name, channel_id: channel.id, fetchDirection }, 'Fetching channel messages is running');
        const messagesToStore = [];
        const options = { limit: 100 };
        if (rawInfo) {
            options[fetchDirection] = rawInfo.messageId;
        }
        let fetchedMessages = await channel.messages.fetch(options);
        while (fetchedMessages.size > 0) {
            const boundaryMessage = fetchDirection === 'before' ? fetchedMessages.last() : fetchedMessages.first();
            if (!boundaryMessage || (period && boundaryMessage.createdAt < period)) {
                if (period) {
                    fetchedMessages = fetchedMessages.filter(msg => msg.createdAt > period);
                }
                channel instanceof discord_js_1.ThreadChannel
                    ? await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()], {
                        threadId: channel.id,
                        threadName: channel.name,
                        channelId: (_a = channel.parent) === null || _a === void 0 ? void 0 : _a.id,
                        channelName: (_b = channel.parent) === null || _b === void 0 ? void 0 : _b.name,
                    })
                    : await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()]);
                break;
            }
            channel instanceof discord_js_1.ThreadChannel
                ? await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()], {
                    threadId: channel.id,
                    threadName: channel.name,
                    channelId: (_c = channel.parent) === null || _c === void 0 ? void 0 : _c.id,
                    channelName: (_d = channel.parent) === null || _d === void 0 ? void 0 : _d.name,
                })
                : await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()]);
            options[fetchDirection] = boundaryMessage.id;
            await services_1.rawInfoService.createRawInfos(connection, messagesToStore);
            fetchedMessages = await channel.messages.fetch(options);
        }
    }
    catch (err) {
        logger.error({ guild_id: connection.name, channel_id: channel.id, fetchDirection, err }, 'Fetching channel messages failed');
    }
    logger.info({ guild_id: connection.name, channel_id: channel.id, fetchDirection }, 'Fetching channel messages is done');
}
/**
 * Fetches messages from a specified channel and its threads and stores their extracted data.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {TextChannel} channel - The channel from which messages are to be fetched.
 * @param {Date} period - A date object specifying the oldest date for the messages to be fetched.
 * @throws Will throw an error if an issue is encountered during processing.
 */
async function handleFetchChannelMessages(connection, channel, period) {
    logger.info({ guild_id: connection.name, channel_id: channel.id }, 'Handle channel messages for channel is running');
    try {
        const oldestChannelRawInfo = await services_1.rawInfoService.getOldestRawInfo(connection, {
            channelId: channel === null || channel === void 0 ? void 0 : channel.id,
            threadId: null,
        });
        const newestChannelRawInfo = await services_1.rawInfoService.getNewestRawInfo(connection, {
            channelId: channel === null || channel === void 0 ? void 0 : channel.id,
            threadId: null,
        });
        if (oldestChannelRawInfo && oldestChannelRawInfo.createdDate > period) {
            await fetchMessages(connection, channel, oldestChannelRawInfo, period, 'before');
        }
        if (newestChannelRawInfo) {
            await fetchMessages(connection, channel, newestChannelRawInfo, period, 'after');
        }
        if (!newestChannelRawInfo && !oldestChannelRawInfo) {
            await fetchMessages(connection, channel, undefined, period, 'before');
        }
        const threads = channel.threads.cache.values();
        for (const thread of threads) {
            const oldestThreadRawInfo = await services_1.rawInfoService.getOldestRawInfo(connection, {
                channelId: channel === null || channel === void 0 ? void 0 : channel.id,
                threadId: thread.id,
            });
            const newestThreadRawInfo = await services_1.rawInfoService.getNewestRawInfo(connection, {
                channelId: channel === null || channel === void 0 ? void 0 : channel.id,
                threadId: thread.id,
            });
            if (oldestThreadRawInfo && oldestThreadRawInfo.createdDate > period) {
                await fetchMessages(connection, thread, oldestThreadRawInfo, period, 'before');
            }
            if (newestThreadRawInfo) {
                await fetchMessages(connection, thread, newestThreadRawInfo, period, 'after');
            }
            if (!newestThreadRawInfo && !oldestThreadRawInfo) {
                await fetchMessages(connection, thread, undefined, period, 'before');
            }
        }
    }
    catch (err) {
        logger.error({ guild_id: connection.name, channel_id: channel.id, err }, 'Handle fetch channel messages failed');
    }
    logger.info({ guild_id: connection.name, channel_id: channel.id }, 'Handle fetch channel messages is done');
}
exports.default = handleFetchChannelMessages;
