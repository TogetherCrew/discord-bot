import 'dotenv/config'

import mongoose from 'mongoose'

import { DatabaseManager, Platform, PlatformNames } from '@togethercrew.dev/db'

import config from '../../config'
import parentLogger from '../../config/logger'

const logger = parentLogger.child({ event: 'deleteSpecificUserData' })

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(config.mongoose.serverURL)
        logger.info('Connected to core MongoDB!')
    } catch (error) {
        logger.fatal('Failed to connect to core MongoDB!', error)
    }
}

export const up = async () => {
    try {
        // const GUILD_ID = '675aea1f2b104f11ad1f5417'
        // const SPECIFIC_DISCORD_ID = '641449673818898472'

        const GUILD_ID = '980858613587382322'
        const SPECIFIC_DISCORD_ID = '681946187490000900'
        await connectToMongoDB()
        const platform = await Platform.findOne({
            name: PlatformNames.Discord,
            'metadata.id': GUILD_ID,
        })
        logger.info(`platform info:${platform}`)

        const guildConnection = await DatabaseManager.getInstance().getGuildDb(GUILD_ID)

        const deleteGuildMemberResult = await guildConnection.models.GuildMember.deleteOne({
            discordId: SPECIFIC_DISCORD_ID,
        })
        logger.info(
            `Platform ${platform?.id}: Deleted GuildMember with discordId = SPECIFIC_DISCORD_ID. Result: ${JSON.stringify(deleteGuildMemberResult)}`
        )

        const deleteRawInfoResult = await guildConnection.models.RawInfo.deleteMany({ author: SPECIFIC_DISCORD_ID })
        logger.info(
            `Platform ${platform?.id}: Deleted RawInfo docs with author = SPECIFIC_VALUE. Result: ${JSON.stringify(deleteRawInfoResult)}`
        )

        const pullUserMentionsResult = await guildConnection.models.RawInfo.updateMany(
            { user_mentions: SPECIFIC_DISCORD_ID },
            { $pull: { user_mentions: SPECIFIC_DISCORD_ID } }
        )
        logger.info(
            `Platform ${platform?.id}: Pulled 'SPECIFIC_VALUE' from user_mentions. Result: ${JSON.stringify(pullUserMentionsResult)}`
        )

        const updateRepliedUserResult = await guildConnection.models.RawInfo.updateMany(
            { replied_user: SPECIFIC_DISCORD_ID },
            { $set: { replied_user: null } }
        )
        logger.info(
            `Platform ${platform?.id}: Set replied_user to null where it was 'SPECIFIC_VALUE'. Result: ${JSON.stringify(updateRepliedUserResult)}`
        )
        await mongoose.connection.close()
        logger.info('Migration completed and core MongoDB connection closed.')
    } catch (err) {
        logger.error(err, 'Migration failed')
        process.exit(1)
    }
}

export const down = async () => {}
