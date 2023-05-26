// async function getOldChannelMessages(connection: Connection, channel: TextChannel | ThreadChannel, rawInfo: IRawInfo, period: Date) {
//     const shouldFetch = true;
//     const messagesToStore: IRawInfo[] = [];
//     let fetchedMessages = await channel.messages.fetch({ limit: 10, before: rawInfo.messageId });
//     while (shouldFetch) {
//         const lastMessage = fetchedMessages.last();
//         if (!lastMessage || lastMessage.createdAt < period) {
//             fetchedMessages = fetchedMessages.filter(
//                 (msg) => msg.createdAt > (period || 0)
//             );
//             channel instanceof ThreadChannel ? await pushMessagesToArray(messagesToStore, [...fetchedMessages.values()], { threadId: channel.id, threadName: channel.name, channelId: channel.parent?.id, channelName: channel.parent?.name }) : await pushMessagesToArray(messagesToStore, [...fetchedMessages.values()])
//             break;
//         }
//         channel instanceof ThreadChannel ? await pushMessagesToArray(messagesToStore, [...fetchedMessages.values()], { threadId: channel.id, threadName: channel.name, channelId: channel.parent?.id, channelName: channel.parent?.name }) : await pushMessagesToArray(messagesToStore, [...fetchedMessages.values()])
//         fetchedMessages = await channel.messages.fetch({ limit: 10, before: lastMessage.id });
//     }
//     console.log(messagesToStore)
//     await rawInfoService.createRawInfos(connection, messagesToStore)
//     console.log('***********A**************')
// }



// async function getNewChannelMessages(connection: Connection, channel: TextChannel | ThreadChannel, rawInfo: IRawInfo) {
//     const shouldFetch = true;
//     const messagesToStore: IRawInfo[] = [];
//     let fetchedMessages = await channel.messages.fetch({ limit: 10, after: rawInfo.messageId });
//     while (shouldFetch) {
//         const firstMessage = fetchedMessages.first();
//         if (!firstMessage || fetchedMessages.size === 0) {
//             break;
//         }
//         channel instanceof ThreadChannel ? await pushMessagesToArray(messagesToStore, [...fetchedMessages.values()], { threadId: channel.id, threadName: channel.name, channelId: channel.parent?.id, channelName: channel.parent?.name }) : await pushMessagesToArray(messagesToStore, [...fetchedMessages.values()])
//         fetchedMessages = await channel.messages.fetch({ limit: 10, after: firstMessage.id });
//     }
//     console.log(messagesToStore)
//     await rawInfoService.createRawInfos(connection, messagesToStore)
//     console.log('***********B*************')
// }

// async function getChannelMessages(connection: Connection, channel: TextChannel | ThreadChannel, period: Date) {
//     const messagesToStore: IRawInfo[] = [];
//     const shouldFetch = true;
//     let fetchedMessages = await channel.messages.fetch({ limit: 10 });
//     if (fetchedMessages.size === 0) {
//         return;
//     }
//     while (shouldFetch) {
//         const lastMessage = fetchedMessages.last();
//         if (!lastMessage || lastMessage.createdAt < (period || 0)) {
//             fetchedMessages = fetchedMessages.filter(
//                 (msg) => msg.createdAt > (period || 0)
//             );
//             channel instanceof ThreadChannel ? await pushMessagesToArray(messagesToStore, [...fetchedMessages.values()], { threadId: channel.id, threadName: channel.name, channelId: channel.parent?.id, channelName: channel.parent?.name }) : await pushMessagesToArray(messagesToStore, [...fetchedMessages.values()])
//             break;
//         }
//         channel instanceof ThreadChannel ? await pushMessagesToArray(messagesToStore, [...fetchedMessages.values()], { threadId: channel.id, threadName: channel.name, channelId: channel.parent?.id, channelName: channel.parent?.name }) : await pushMessagesToArray(messagesToStore, [...fetchedMessages.values()])
//         fetchedMessages = await channel.messages.fetch({ limit: 10, before: lastMessage.id });
//     }
//     console.log(messagesToStore)
//     await rawInfoService.createRawInfos(connection, messagesToStore)
//     console.log('*************C***********')
// }


// import { Client, Message, TextChannel, Collection, User, Role, ThreadChannel, Snowflake } from 'discord.js';
// import { IRawInfo, databaseService } from 'tc_dbcomm';
// import { rawInfoService, guildService } from '../database/services';
// import config from '../config';
// import { Connection } from 'mongoose';







// export default async function guildExtraction(client: Client, guildId: Snowflake) {
//     try {
//         const guild = await client.guilds.fetch(guildId);
//         const channel = (await guild.channels.fetch(channelId)) as TextChannel;
//         const guildDoc = await guildService.getGuild({ guildId: '980858613587382322' })
//         const connection = databaseService.connectionFactory('980858613587382322', config.mongoose.dbURL);
//         const oldestChannelRawInfo = await rawInfoService.getOldestRawInfo(connection, { channelId, threadId: null });
//         const newestChannelRawInfo = await rawInfoService.getNewestRawInfo(connection, { channelId, threadId: null });
//         if (oldestChannelRawInfo && guildDoc?.period) {
//             if (guildDoc?.period < oldestChannelRawInfo.createdDate) {
//                 await fetchChannelMessagesX(connection, channel, oldestChannelRawInfo, guildDoc?.period, 'before')
//             }
//         }

//         if (newestChannelRawInfo) {
//             await fetchChannelMessagesX(connection, channel, newestChannelRawInfo, undefined, 'after')

//         }

//         if (!newestChannelRawInfo && !oldestChannelRawInfo && guildDoc?.period) {
//             await fetchChannelMessagesX(connection, channel, undefined, guildDoc?.period, 'before')
//         }

//         const threads = channel.threads.cache.values();

//         for (const thread of threads) {
//             const oldestThreadRawInfo = await rawInfoService.getOldestRawInfo(connection, { channelId, threadId: thread.id });
//             const newestThreadRawInfo = await rawInfoService.getNewestRawInfo(connection, { channelId, threadId: thread.id });

//             if (oldestThreadRawInfo && guildDoc?.period) {
//                 if (guildDoc?.period < oldestThreadRawInfo.createdDate) {
//                     await fetchChannelMessagesX(connection, thread, oldestThreadRawInfo, guildDoc?.period, 'before')
//                 }
//             }

//             if (newestThreadRawInfo) {
//                 await fetchChannelMessagesX(connection, thread, newestThreadRawInfo, undefined, 'after')
//             }

//             if (!newestThreadRawInfo && !oldestThreadRawInfo && guildDoc?.period) {
//                 await fetchChannelMessagesX(connection, thread, undefined, guildDoc?.period, 'before')
//             }
//         }

//         console.log('***DONE')


//     } catch (err) {
//         console.log(err);
//     }
// }

// GUILD : 980858613587382322
// Channel name: Text Channels, ID: 980858613587382323
// Channel name: Voice Channels, ID: 980858613587382324
// Channel name: general, ID: 980858613587382325
// Channel name: General, ID: 980858613587382326
// Channel name: test, ID: 1029501237554581564
// Channel name: special-channel-💪, ID: 1045029797346160741
// Channel name: smalltest, ID: 1045807353729134592
// Channel name: sss, ID: 1050520586692075533
// Channel name: 🏁start-here, ID: 1050530657253736578
// Channel name: ✅introductions, ID: 1050531295765201086
// Channel name: 📘directory, ID: 1050531395191181352
// Channel name: support, ID: 1070322209811349554
// Channel name: new-channel-1, ID: 1105164023009386596
// Channel name: new-category, ID: 1105752192629088267
// Channel name: c1, ID: 1105752303820083221
// Channel name: c2-voice, ID: 1105752336124612719
// Channel name: c3-private, ID: 1105752380026392576
// Channel name: tag, ID: 1108405617846128734
// Channel name: c4, ID: 1109052576978173982
// Channel name: do-not-spam-here, ID: 1109369850276610048
// Channel name: do-not-spam, ID: 1109421233436635198
// Channel name: test1, ID: 1110556724844310568

