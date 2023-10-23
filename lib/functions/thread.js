"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrivateThreadAndSendMessage = void 0;
const discord_js_1 = require("discord.js");
/**
 * create a private thread on specific channel and send a message to it
 * @param channel channel you want create a thread on it
 * @param info
 * @returns thread object
 */
async function createPrivateThreadAndSendMessage(channel, info) {
    const { threadName, message, threadReason } = info;
    const thread = await channel.threads.create({
        name: threadName,
        reason: threadReason,
        type: discord_js_1.ChannelType.PrivateThread,
        invitable: false,
    });
    await thread.send(message);
    return thread;
}
exports.createPrivateThreadAndSendMessage = createPrivateThreadAndSendMessage;
