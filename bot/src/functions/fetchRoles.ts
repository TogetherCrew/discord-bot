import { type Connection, type HydratedDocument } from 'mongoose'
import { type IPlatform, type IRole } from '@togethercrew.dev/db'
import { roleService, platformService } from '../database/services'
import parentLogger from '../config/logger'
import { coreService } from '../services'

const logger = parentLogger.child({ module: 'FetchRoles' })

/**
 * Fetches and saves role information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Snowflake} guildId - The identifier of the guild to extract roles from.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function fetchGuildRoles(connection: Connection, platform: HydratedDocument<IPlatform>) {
    try {
        const client = await coreService.DiscordBotManager.getClient()
        const hasBotAccessToGuild = await platformService.checkBotAccessToGuild(platform.metadata?.id)
        let rolesToStore: IRole[] = []
        if (!hasBotAccessToGuild) {
            logger.info({ guild_id: platform.metadata?.id }, 'Bot access missing')
            return
        }
        const guild = await client.guilds.fetch(platform.metadata?.id)
        logger.info({ guild_id: platform.metadata?.id }, 'Fetching roles')
        const fetchedRoles = await guild.roles.fetch()
        rolesToStore = fetchedRoles.map(roleService.getNeededDateFromRole)
        await roleService.createRoles(connection, rolesToStore)
        logger.info({ guild_id: platform.metadata?.id }, 'Roles stored successfully')
    } catch (error) {
        logger.error({ guild_id: platform.metadata?.id, error }, 'Failed to fetch roles')
    }
}
