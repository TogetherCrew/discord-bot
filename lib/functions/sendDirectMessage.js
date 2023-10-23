"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param client
 * @param info
 * @returns throw error if User has DMs closed or has no mutual servers with the bot
 */
async function sendDirectMessage(client, info) {
    const { discordId, message } = info;
    // Fetch the user object
    const user = await client.users.fetch(discordId);
    // Send a private message
    const sendResponse = await user.send(message);
    return sendResponse;
}
exports.default = sendDirectMessage;
