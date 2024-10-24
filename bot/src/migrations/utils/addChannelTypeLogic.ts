/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type TextChannel, type Snowflake, type VoiceChannel } from 'discord.js'
import { type Connection } from 'mongoose'
import parentLogger from '../../config/logger'
import { coreService } from '../../services'

const logger = parentLogger.child({ module: 'Migration' })

/**
 *
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Snowflake} guildId - The identifier of the guild to extract information from.
 */
async function channelMigration(connection: Connection, guildId: Snowflake) {
    const client = await coreService.DiscordBotManager.getClient()

    logger.info({ guild_id: guildId }, 'Migration is running')
    try {
        const updates: Array<{ channelId: string; type: number }> = []
        const guild = await client.guilds.fetch(guildId)
        const channels = [...guild.channels.cache.values()].filter(
            (channel) =>
                channel.type === 0 || channel.type === 2 || channel.type === 4
        ) as Array<TextChannel | VoiceChannel>

        for (const channel of channels) {
            updates.push({ channelId: channel.id, type: channel.type })
        }

        // Convert the updates array to the format required by bulkWrite
        const operations = updates.map((update) => ({
            updateOne: {
                filter: { channelId: update.channelId }, // Filter documents by channelId
                update: { $set: { type: update.type } }, // Correct usage of atomic operator
            },
        }))

        // Execute the bulkWrite operation
        connection.models.Channel.bulkWrite(operations)
            .then((result) => {
                logger.info({ result }, 'Bulk update result')
            })
            .catch((error) => {
                logger.error({ error }, 'Bulk update error')
            })
    } catch (err) {
        logger.error({ guild_id: guildId, err }, 'Migration is failed')
    }
    logger.info({ guild_id: guildId }, 'Migration is done')
}

export default channelMigration
