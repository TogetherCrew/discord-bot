import { Client, TextChannel } from 'discord.js';
import { PermissionsBitField } from 'discord.js'
import { databaseService } from 'tc_dbcomm'
import { rawInfoService } from '../database/services'

import config from '../config'


export default async function fetchChannelMessages(client: Client, channelId: string, period: Date) {
    try {
        const guild = await client.guilds.fetch('980858613587382322');
        const channel = await guild.channels.fetch(channelId) as TextChannel;
        const connection = databaseService.connectionFactory(
            '980858613587382322',
            config.mongoose.dbURL
        )

        const rawInfo = await rawInfoService.getNewestRawInfoByChannel(connection, channelId);
        console.log(period)
        if (!rawInfo) {
            let lastMessageId = 'null';
            const fetchLimit = 10;
            let fetchedMessages = await channel.messages.fetch({ limit: fetchLimit });
            let shouldFetch = true;
            while (shouldFetch) {
                console.log(fetchedMessages.map((msg) => { return { content: msg.content, createdAt: msg.createdAt } }));
                console.log('*******************');

                const lastMessage = fetchedMessages.last();
                if (!lastMessage || lastMessage.createdAt < period) {
                    // need to filter
                    shouldFetch = false;

                }
                else {
                    lastMessageId = lastMessage.id;
                }
                fetchedMessages = await channel.messages.fetch({ limit: fetchLimit, before: lastMessageId });
            }
        }






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
    } catch (err) {
        console.log(err)
    }

}

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