import { ChannelType, TextChannel } from "discord.js";

/**
 * create a private thread on specific channel and send a message to it
 * @param channel channel you want create a thread on it
 * @param info 
 * @returns thread object
 */
export async function createPrivateThreadAndSendMessage(channel: TextChannel, info: { threadName: string, message: string, threadReason?: string }) {
    const { threadName, message, threadReason } = info

    const thread = await channel.threads.create({
        name: threadName,
        reason: threadReason,
        type: ChannelType.PrivateThread,
        invitable: false,
    });

    await thread.send(message)

    return thread
}
