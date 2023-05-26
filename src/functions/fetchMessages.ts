import { Message, TextChannel, Collection, User, Role, ThreadChannel, Snowflake } from 'discord.js';
import { IRawInfo } from 'tc_dbcomm';
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

async function getReactions(message: Message) {
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

async function getNeedDataFromMessage(message: Message, threadInfo?: threadInfo): Promise<IRawInfo> {
  if (threadInfo) {
    return {
      type: message.type,
      author: message.author.id,
      content: message.content,
      createdDate: message.createdAt,
      role_mentions: message.mentions.roles.map((role: Role) => role.id),
      user_mentions: message.mentions.users.map((user: User) => user.id),
      replied_user: message.type === 19 ? message.mentions.repliedUser?.id : null,
      reactions: await getReactions(message),
      messageId: message.id,
      channelId: threadInfo?.channelId ? threadInfo?.channelId : '',
      channelName: threadInfo?.channelName ? threadInfo?.channelName : '',
      threadId: threadInfo?.threadId ? threadInfo?.threadId : null,
      threadName: threadInfo?.threadName ? threadInfo?.threadName : null,
    };
  } else {
    return {
      type: message.type,
      author: message.author.id,
      content: message.content,
      createdDate: message.createdAt,
      role_mentions: message.mentions.roles.map((role: Role) => role.id),
      user_mentions: message.mentions.users.map((user: User) => user.id),
      replied_user: message.type === 19 ? message.mentions.repliedUser?.id : null,
      reactions: await getReactions(message),
      messageId: message.id,
      channelId: message.channelId,
      channelName: message.channel instanceof TextChannel ? message.channel.name : null,
      threadId: null,
      threadName: null,
    };
  }
}

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

async function fetchMessages(
  connection: Connection,
  channel: TextChannel | ThreadChannel,
  rawInfo: IRawInfo | undefined = undefined,
  period: Date,
  fetchDirection: 'before' | 'after' = 'before'
) {
  const messagesToStore: IRawInfo[] = [];
  const options: FetchOptions = { limit: 10 };
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
      channel instanceof ThreadChannel
        ? await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()], {
            threadId: channel.id,
            threadName: channel.name,
            channelId: channel.parent?.id,
            channelName: channel.parent?.name,
          })
        : await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()]);
      break;
    }

    channel instanceof ThreadChannel
      ? await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()], {
          threadId: channel.id,
          threadName: channel.name,
          channelId: channel.parent?.id,
          channelName: channel.parent?.name,
        })
      : await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()]);
    options[fetchDirection] = boundaryMessage.id;
    fetchedMessages = await channel.messages.fetch(options);
  }
  await rawInfoService.createRawInfos(connection, messagesToStore);
}

export default async function fetchChannelMessages(connection: Connection, channel: TextChannel, period: Date) {
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
}
