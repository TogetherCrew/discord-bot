import { TextChannel, VoiceChannel } from 'discord.js';
import { Connection, HydratedDocument } from 'mongoose';

import { IChannel, IPlatform } from '@togethercrew.dev/db';

import parentLogger from '../config/logger';
import { channelService, platformService } from '../database/services';
import { coreService } from '../services';

const logger = parentLogger.child({ module: 'FetchChannels' })

export default async function fetchGuildChannels(connection: Connection, platform: HydratedDocument<IPlatform>) {
    try {
        const bot = coreService.DiscordBotManager.getInstance()
        const client = await bot.getClient()
        const hasBotAccessToGuild = await platformService.checkBotAccessToGuild(platform.metadata?.id)
        if (!hasBotAccessToGuild) {
            return
        }
        const guild = await client.guilds.fetch(platform.metadata?.id)
        let channelsToStore: IChannel[] = []
        logger.info({ guild_id: platform.metadata?.id }, 'Fetching channels')
        const fetchedChannels = await guild.channels.fetch()
        const filterNeededChannels = [...fetchedChannels.values()].filter(
            (channel) => channel?.type === 0 || channel?.type === 2 || channel?.type === 4
        ) as Array<TextChannel | VoiceChannel>
        channelsToStore = filterNeededChannels.map(channelService.getNeededDateFromChannel)
        await channelService.createChannels(connection, channelsToStore)
        logger.info({ guild_id: platform.metadata?.id }, 'Channels stored successfully')
    } catch (error) {
        logger.error({ guild_id: platform.metadata?.id, error }, 'Failed to fetch channels')
    }
}
