import 'dotenv/config';

import mongoose from 'mongoose';

import { DatabaseManager, Platform, PlatformNames } from '@togethercrew.dev/db';

import config from '../../config';
import parentLogger from '../../config/logger';

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
        // const USER_ID = '641449673818898472'

        const GUILD_ID = '980858613587382322'
        const USER_ID = '681946187490000900'
        await connectToMongoDB()
        const platform = await Platform.findOne({
            name: PlatformNames.Discord,
            'metadata.id': GUILD_ID,
        })
        logger.info(`platform info:${platform}`)

        const guildConnection = await DatabaseManager.getInstance().getGuildDb(GUILD_ID)

        const deleteGuildMemberResult = await guildConnection.models.GuildMember.deleteOne({
            discordId: USER_ID,
        })

        const deleteRawInfoResult = await guildConnection.models.RawInfo.deleteMany({ author: USER_ID })

        const pullUserMentionsResult = await guildConnection.models.RawInfo.updateMany(
            { user_mentions: USER_ID },
            { $pull: { user_mentions: USER_ID } }
        )
        const updateRepliedUserResult = await guildConnection.models.RawInfo.updateMany(
            { replied_user: USER_ID },
            { $set: { replied_user: null } }
        )
        await mongoose.connection.close()
        logger.info('Migration completed and core MongoDB connection closed.')
    } catch (err) {
        logger.error(err, 'Migration failed')
        process.exit(1)
    }
}

export const down = async () => {}
