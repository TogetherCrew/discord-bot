import 'dotenv/config';

import mongoose from 'mongoose';

import { DatabaseManager, Platform } from '@togethercrew.dev/db';

import config from '../../config';
import logger from '../../config/logger';

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
        const PLATFORM_ID = '67728c686be658065fae38c2'
        const SPECIFIC_DISCORD_ID = '681946187490000900'
        await connectToMongoDB()

        const platform = await Platform.findById(PLATFORM_ID)
        logger.info(`platform info:${platform}`)

        const guildConnection = await DatabaseManager.getInstance().getGuildDb(platform?.metadata?.id)

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
