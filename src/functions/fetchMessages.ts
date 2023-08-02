import { Message, TextChannel, Collection, User, Role, ThreadChannel, Snowflake } from 'discord.js';
import { IRawInfo } from '@togethercrew.dev/db';
import { rawInfoService } from '../database/services';
import { Connection } from 'mongoose';

interface threadInfo {
  threadId: Snowflake;
  threadName: string;
  channelId: Snowflake | undefined;
  channelName: string | undefined;
}

interface FetchOptions {
  limit: number;
  before?: Snowflake;
  after?: Snowflake;
}

/**
 * Fetches reaction details from a message.
 * @param {Message} message - The message object from which reactions are to be fetched.
 * @returns {Promise<string[]>} - A promise that resolves to an array of strings where each string is a comma-separated list of user IDs who reacted followed by the reaction emoji.
 */
async function getReactions(message: Message): Promise<string[]> {
  try {
    const reactions = message.reactions.cache;
    const reactionsArray = [...reactions.values()];
    const reactionsArr = [];

    for (const reaction of reactionsArray) {
      const emoji = reaction.emoji;
      const users: Collection<string, User> = await reaction.users.fetch();
      let usersString = users.map(user => `${user.id}`).join(',');
      usersString += `,${emoji.name}`;
      reactionsArr.push(usersString);
    }

    return reactionsArr;
  } catch (err) {
    console.log(err);
    return [];
  }
}

/**
 * Extracts necessary data from a given message.
 * @param {Message} message - The message object from which data is to be extracted.
 * @param {threadInfo} threadInfo - An optional thread info object containing details about the thread the message is part of.
 * @returns {Promise<IRawInfo>} - A promise that resolves to an object of type IRawInfo containing the extracted data.
 */
async function getNeedDataFromMessage(message: Message, threadInfo?: threadInfo): Promise<IRawInfo> {
  const type = message.type;
  const author = message.author.id;
  const content = message.content;
  const createdDate = message.createdAt;
  const role_mentions = message.mentions.roles.map((role: Role) => role.id);
  const user_mentions = message.mentions.users.map((user: User) => user.id);
  const replied_user = message.type === 19 ? message.mentions.repliedUser?.id : null;
  const reactions = await getReactions(message);
  const messageId = message.id;

  let channelId;
  if (threadInfo) channelId = threadInfo?.channelId ? threadInfo?.channelId : '';
  else channelId = message.channelId;

  let channelName;
  if (threadInfo) channelName = threadInfo?.channelName ? threadInfo?.channelName : '';
  else channelName = message.channel instanceof TextChannel ? message.channel.name : null;

  let threadId;
  if (threadInfo) threadId = threadInfo?.threadId ? threadInfo?.threadId : null;
  else threadId = null;

  let threadName;
  if (threadInfo) threadName = threadInfo?.threadName ? threadInfo?.threadName : null;
  else threadName = null;

  return {
    type,
    author,
    content,
    createdDate,
    role_mentions,
    user_mentions,
    replied_user,
    reactions,
    messageId,
    channelId,
    channelName,
    threadId,
    threadName,
  };
}

/**
 * Iterates over a list of messages and pushes extracted data from each message to an array.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo[]} arr - The array to which extracted data will be pushed.
 * @param {Message[]} messagesArray - An array of messages from which data is to be extracted.
 * @param {threadInfo} threadInfo - An optional thread info object containing details about the thread the messages are part of.
 * @returns {Promise<IRawInfo[]>} - A promise that resolves to the updated array containing the extracted data.
 */
async function pushMessagesToArray(
  connection: Connection,
  arr: IRawInfo[],
  messagesArray: Message[],
  threadInfo?: threadInfo
): Promise<IRawInfo[]> {
  const allowedTypes: number[] = [0, 18, 19];
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
async function fetchMessages(
  connection: Connection,
  channel: TextChannel | ThreadChannel,
  rawInfo: IRawInfo | undefined = undefined,
  period: Date,
  fetchDirection: 'before' | 'after' = 'before'
) {
  try {
    console.log(`fetch msgs is running for ${channel.name}: ${channel.id}`);
    const messagesToStore: IRawInfo[] = [];
    const options: FetchOptions = { limit: 10 };
    if (rawInfo) {
      options[fetchDirection] = rawInfo.messageId;
    }
    let fetchedMessages = await channel.messages.fetch(options);

    while (fetchedMessages.size > 0) {
      const boundaryMessage = fetchDirection === 'before' ? fetchedMessages.last() : fetchedMessages.first();
      const isBoundaryMessage = !boundaryMessage || (period && boundaryMessage.createdAt < period);

      if (isBoundaryMessage && period) fetchedMessages = fetchedMessages.filter(msg => msg.createdAt > period);

      channel instanceof ThreadChannel
        ? await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()], {
            threadId: channel.id,
            threadName: channel.name,
            channelId: channel.parent?.id,
            channelName: channel.parent?.name,
          })
        : await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()]);

      if (isBoundaryMessage) break;
      else {
        options[fetchDirection] = boundaryMessage.id;
        fetchedMessages = await channel.messages.fetch(options);
      }
    }
    await rawInfoService.createRawInfos(connection, messagesToStore);
    console.log(`fetch msgs is done for ${channel.name}: ${channel.id}`);
  } catch (err) {
    console.log(`Failed to fetchMessages of channle: ${channel.id} `, err);
  }
}

/**
 * Fetches messages from a specified channel and its threads and stores their extracted data.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {TextChannel} channel - The channel from which messages are to be fetched.
 * @param {Date} period - A date object specifying the oldest date for the messages to be fetched.
 * @throws Will throw an error if an issue is encountered during processing.
 */
export default async function fetchChannelMessages(connection: Connection, channel: TextChannel, period: Date) {
  try {
    console.log(`fetch channel messages is running for ${channel.name}: ${channel.id} : ${channel.type}`);
    const oldestChannelRawInfo = await rawInfoService.getOldestRawInfo(connection, {
      channelId: channel?.id,
      threadId: null,
    });
    const newestChannelRawInfo = await rawInfoService.getNewestRawInfo(connection, {
      channelId: channel?.id,
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
      const oldestThreadRawInfo = await rawInfoService.getOldestRawInfo(connection, {
        channelId: channel?.id,
        threadId: thread.id,
      });
      const newestThreadRawInfo = await rawInfoService.getNewestRawInfo(connection, {
        channelId: channel?.id,
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
    console.log(`fetch channel messages is done for ${channel.name}: ${channel.id} : ${channel.type}`);
    console.log('###################################');
  } catch (err) {
    console.log(`Failed to fetchChannelMessages of channle: ${channel.id} `, err);
  }
}
