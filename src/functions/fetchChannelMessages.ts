import { Client, Message, TextChannel, Collection, User, Role } from 'discord.js';
import { Guild, IRawInfo, databaseService } from 'tc_dbcomm';
import { rawInfoService, guildService } from '../database/services';
import config from '../config';


async function getReactions(message: Message) {

    try {
        const reactions = message.reactions.cache;
        const reactionsArray = [...reactions.values()];
        const reactionsArr = [];

        for (const reaction of reactionsArray) {
            const emoji = reaction.emoji;
            const users: Collection<string, User> = await reaction.users.fetch(); let usersString = users
                .map((user) => `${user.id}`)
                .join(',');
            usersString += `,${emoji.name}`
            reactionsArr.push(usersString);
        }

        return reactionsArr;
    } catch (err) {
        console.log(err);
        return [];
    }
}

async function getNeedDataFromMessage(message: Message): Promise<IRawInfo> {
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
        threadId: message.thread ? message.thread.id : null,
        threadName: message.thread?.name ? message.thread.name : null,
    }
}
export default async function fetchChannelMessages(
    client: Client,
    channelId: string,
) {
    try {
        const guild = await client.guilds.fetch('980858613587382322');
        const channel = (await guild.channels.fetch(channelId)) as TextChannel;
        const guildDoc = await guildService.getGuild({ guildId: '980858613587382322' })
        const connection = databaseService.connectionFactory(
            '980858613587382322',
            config.mongoose.dbURL
        );

        const oldestRawInfo = await rawInfoService.getOldestRawInfoByChannel(
            connection,
            channelId
        );

        const newestRawInfo = await rawInfoService.getNewestRawInfoByChannel(
            connection,
            channelId
        );



        if (oldestRawInfo && guildDoc?.period) {
            if (guildDoc?.period < oldestRawInfo.createdDate) {
                const shouldFetch = true;
                const messagesToStore: IRawInfo[] = [];
                let fetchedMessages = await channel.messages.fetch({ limit: 10, before: oldestRawInfo.messageId });
                while (shouldFetch) {
                    const lastMessage = fetchedMessages.last();
                    if (!lastMessage || lastMessage.createdAt < guildDoc.period) {
                        fetchedMessages = fetchedMessages.filter(
                            (msg) => msg.createdAt > (guildDoc?.period || 0)
                        );
                        const messagesArray = [...fetchedMessages.values()];
                        for (const message of messagesArray) {
                            await messagesToStore.push(await getNeedDataFromMessage(message));
                        }
                        break;
                    }
                    const messagesArray = [...fetchedMessages.values()];
                    for (const message of messagesArray) {
                        await messagesToStore.push(await getNeedDataFromMessage(message));
                    }
                    fetchedMessages = await channel.messages.fetch({ limit: 10, before: lastMessage.id });
                }
                await rawInfoService.createRawInfos(connection, messagesToStore)
            }
        }

        // NEW
        if (newestRawInfo) {
            const shouldFetch = true;
            const messagesToStore: IRawInfo[] = [];
            let fetchedMessages = await channel.messages.fetch({ limit: 10, after: newestRawInfo.messageId });
            while (shouldFetch) {
                const firstMessage = fetchedMessages.first();
                if (!firstMessage || fetchedMessages.size === 0) {
                    break;
                }
                const messagesArray = [...fetchedMessages.values()];
                for (const message of messagesArray) {
                    await messagesToStore.push(await getNeedDataFromMessage(message));
                }
                fetchedMessages = await channel.messages.fetch({ limit: 10, after: firstMessage.id });
            }
            await rawInfoService.createRawInfos(connection, messagesToStore)

        }

        // C
        if (!newestRawInfo && !oldestRawInfo) {
            const messagesToStore: IRawInfo[] = [];
            const shouldFetch = true;
            let fetchedMessages = await channel.messages.fetch({ limit: 10 });
            if (fetchedMessages.size === 0) {
                // return messagesToStore;
                console.log(messagesToStore);
                return;
            }
            while (shouldFetch) {
                const lastMessage = fetchedMessages.last();
                if (!lastMessage || lastMessage.createdAt < (guildDoc?.period || 0)) {
                    fetchedMessages = fetchedMessages.filter(
                        (msg) => msg.createdAt > (guildDoc?.period || 0)
                    );
                    const messagesArray = [...fetchedMessages.values()];
                    for (const message of messagesArray) {
                        await messagesToStore.push(await getNeedDataFromMessage(message));
                    }
                    break;
                }
                const messagesArray = [...fetchedMessages.values()];
                for (const message of messagesArray) {
                    await messagesToStore.push(await getNeedDataFromMessage(message));
                }
                fetchedMessages = await channel.messages.fetch({ limit: 10, before: lastMessage.id });

            }
            await rawInfoService.createRawInfos(connection, messagesToStore)

        }
    } catch (err) {
        console.log(err);
    }
}

// const rawInfo = await rawInfoService.getNewestRawInfoByChannel(connection, channelId);
// if (!rawInfo) {
//     const messagesToStore:any = [];
//     let lastMessageId = null;
//     const shouldFetch = true;

//     const initialMessages = await channel.messages.fetch({ limit: 10 });
//     if (initialMessages.size === 0) {
//       return messagesToStore;
//     }

//     while (shouldFetch) {
//       const fetchedMessages = await channel.messages.fetch({ limit: 10, before: lastMessageId });

//       if (fetchedMessages.size === 0 || fetchedMessages.last().createdAt < period) {
//         const filteredMessages = fetchedMessages.filter((msg) => msg.createdAt > period);
//         messagesToStore.push(...filteredMessages.map((msg) => ({ content: msg.content, createdAt: msg.createdAt })));
//         break;
//       }

//       lastMessageId = fetchedMessages.last().id;
//       messagesToStore.push(...fetchedMessages.map((msg) => ({ content: msg.content, createdAt: msg.createdAt })));
//     }

//     return messagesToStore;
// }
// if (!lastMessage || lastMessage.createdAt < period) {
//     fetchedMessages = fetchedMessages.filter((msg) => msg.createdAt > period)
//     messagesToStore.push(...fetchedMessages.map((msg) => ({ content: msg.content, createdAt: msg.createdAt })));
//     break;
// }
// else {
//     lastMessageId = lastMessage.id;
// }
// messagesToStore.push(...fetchedMessages.map((msg) => ({ content: msg.content, createdAt: msg.createdAt })));
// fetchedMessages = await channel.messages.fetch({ limit: 10, before: lastMessageId });

// if (!client.user) {
//     throw new Error();
// }
// const botMember = await guild.members.fetch(client.user.id);
// const botPermissions = channel.permissionsFor(botMember);
// const canReadMessageHistoryAndViewChannel = botPermissions.has([PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ViewChannel]);
// console.log(canReadMessageHistoryAndViewChannel)
// const messages = await channel.messages.fetch({ limit: 100 });
// // Convert messages to an array
// // Convert messages to an array
// const messagesArray = [...messages.values()];

// // For each message
// for (const message of messagesArray) {
//     const mentionedUsers = message.mentions.users;
//     const mentionedRoles = message.mentions.roles;

//     console.log(`type: ${message.type}`)
//     console.log(`author: ${message.author.id}`)
//     console.log(`content: ${message.content}`)
//     console.log(`createdDate: ${message.createdAt}`)
//     console.log(`message Id: ${message.id}`)
//     console.log(`role mentions: ${mentionedRoles.map((role) => role.id)}`)
//     console.log(`user mentions: ${mentionedUsers.map((user) => user.id)}`)
//     if (message.type === 19) {
//         console.log(`replied user: ${message.mentions.repliedUser?.id}`);
//     } else {
//         console.log(`replied user: ${null}`);
//     }

//     const reactions = message.reactions.cache;
//     const reactionsArray = [...reactions.values()];
//     const reactionsArr: any = [];
//     for (const reaction of reactionsArray) {
//         const emoji = reaction.emoji;

//         const users = await reaction.users.fetch();

//         users.forEach((user) => {
//             const userId = user.id;
//             const emojiName = emoji.name;
//             reactionsArr.push({ userId, emojiName })
//         });
//     }
//     console.log(`reactions: ${reactionsArr}`)

//     console.log(`channel Id: ${message.channelId}`)
//     console.log(`channel name: ${message.channel.name}`)
//     if (message.thread) {
//         console.log(`thread Id: ${message.thread?.id}`)
//         console.log(`thread name: ${message.thread?.name}`)
//     } else {
//         console.log(`thread Id: ${null}`)
//         console.log(`thread name: ${null}`)
//     }

//     console.log('*******************');

// }

// const threads = await channel.threads.cache;
// threads.forEach(async (thread) => {
//     const messages = await thread.messages.fetch();
//     console.log(`***************${thread.name}******************************`)
//     messages.forEach((message) => {
//         console.log(message.type, message?.content);
//     });
// });

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

// const messages = await channel.messages.fetch({ limit: 100 });

// messages.forEach((message) => {
//     console.log(message.type)
//     // console.log(new Date(message?.createdTimestamp))
//     // console.log(message?.content);
//     // console.log(message?.mentions);
// });
// const threads = await channel.threads.cache;
// threads.forEach(async (thread) => {
//     const threadMessages = await thread.messages.fetch({ limit: 100 });
//     console.log(threadMessages)
//     // console.log(new Date(message?.createdTimestamp))
//     // console.log(message?.content);
//     // console.log(message?.mentions);
// });
