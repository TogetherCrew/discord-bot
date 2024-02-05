import { type Snowflake, type Message } from 'discord.js'
import coreService from './core.service'

/**
 * Send direct message to user.
 * @param {Snowflake} discordId - user discordId.
 * @param {string} message - message string.
 * @returns {Promise<Message | undefined>} A promise that resolves with the sent message or undefined.
 */
async function sendDirectMessage(
  discordId: Snowflake,
  message: string
): Promise<Message | undefined> {
  const client = await coreService.DiscordBotManager.getClient()
  const user = await client.users.fetch(discordId)
  if (user !== null && user !== undefined) {
    return await user.send(message)
  }
}

export default {
  sendDirectMessage,
}
