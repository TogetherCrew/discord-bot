import { Events, GuildChannel, Channel, TextChannel } from 'discord.js';
import { channelService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';

export default {
    name: Events.ChannelDelete,
    once: false,
    async execute(channel: Channel) {
        try {
            if (channel instanceof GuildChannel && channel instanceof TextChannel) {
                const connection = databaseService.connectionFactory(channel.guildId, config.mongoose.dbURL);
                const channelDoc = await channelService.getChannel(connection, { channelId: channel.id });
                await channelDoc?.softDelete();
                await closeConnection(connection)
            }
        } catch (err) {
            // TODO: improve error handling
            console.log(err);
        }
    },
};
