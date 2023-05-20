import { Client, TextChannel, Message, MessageReaction, User } from 'discord.js';
import { PermissionsBitField } from 'discord.js'

async function reactions(message: Message) {
    const reactions = message.reactions.cache;

    // Fetch and iterate over each reaction to print users who reacted
    reactions.forEach(async (reaction) => {
        console.log(`Reaction: ${reaction.emoji.name}`);
        console.log(`Users who reacted:`);
        const users = await reaction.users.fetch();
        users.forEach((user) => {
            console.log(`- ${user.id}`);
            // You can access other properties of the user as needed, e.g., user.id, user.avatarURL(), etc.
        });
    })
}

export default async function fetchChannelMessages(client: Client, channelId: string, period: Date) {
    try {
        const guild = await client.guilds.fetch('980858613587382322');
        const channel = await guild.channels.fetch(channelId) as TextChannel;

        if (!client.user) {
            throw new Error();
        }
        const botMember = await guild.members.fetch(client.user.id);
        const botPermissions = channel.permissionsFor(botMember);
        const canReadMessageHistoryAndViewChannel = botPermissions.has([PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ViewChannel]);
        console.log(canReadMessageHistoryAndViewChannel)
        const messages = await channel.messages.fetch({ limit: 100 });

        for (const message of messages) {
            console.log((message.reactions.cache));
            const mentionedUsers = message.mentions.users;
            const mentionedRoles = message.mentions.roles;

            mentionedRoles.forEach((role) => {
                console.log(`Mentioned role: ${role.id}`);
                // You can access other properties of the role as needed, e.g., role.id, role.hexColor, etc.
            });
            mentionedUsers.forEach((user) => {
                console.log(`Mentioned user: ${user.id}`);
                // You can access other properties of the user as needed, e.g., user.id, user.avatarURL(), etc.
            });

            // await reactions(message);
            // Get all reactions on the message
            const reactions = message.reactions.cache;

            // Iterate over each reaction
            reactions.forEach((reaction: MessageReaction) => {
                // Get the emoji
                const emoji = reaction.emoji;

                // Get all users who reacted with this emoji
                reaction.users.fetch().then((users: Map<string, User>) => {
                    // Iterate over each user
                    users.forEach((user: User) => {
                        // Extract the user ID and the emoji
                        const userId = user.id;
                        const emojiName = emoji.name;

                        // Do whatever you want with the user ID and emoji
                        console.log(`User ID: ${userId}, Emoji: ${emojiName}`);
                    });
                });
            });
            console.log('*******************')
        }
        // messages.forEach(async (message) => {
        //     // console.log((message.reactions.cache));
        //     const mentionedUsers = message.mentions.users;
        //     const mentionedRoles = message.mentions.roles;

        //     mentionedRoles.forEach((role) => {
        //         console.log(`Mentioned role: ${role.id}`);
        //         // You can access other properties of the role as needed, e.g., role.id, role.hexColor, etc.
        //     });
        //     mentionedUsers.forEach((user) => {
        //         console.log(`Mentioned user: ${user.id}`);
        //         // You can access other properties of the user as needed, e.g., user.id, user.avatarURL(), etc.
        //     });

        //     // await reactions(message);
        //     // Get all reactions on the message
        //     const reactions = message.reactions.cache;

        //     // Iterate over each reaction
        //     reactions.forEach((reaction: MessageReaction) => {
        //         // Get the emoji
        //         const emoji = reaction.emoji;

        //         // Get all users who reacted with this emoji
        //         reaction.users.fetch().then((users: Map<string, User>) => {
        //             // Iterate over each user
        //             users.forEach((user: User) => {
        //                 // Extract the user ID and the emoji
        //                 const userId = user.id;
        //                 const emojiName = emoji.name;

        //                 // Do whatever you want with the user ID and emoji
        //                 console.log(`User ID: ${userId}, Emoji: ${emojiName}`);
        //             });
        //         });
        //     });
        //     console.log('*******************')
        // });

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