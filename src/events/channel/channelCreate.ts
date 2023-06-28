import { Events, Channel, GuildChannel, TextChannel } from 'discord.js';
import { channelService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';

export default {
    name: Events.ChannelCreate,
    once: false,
    async execute(channel: Channel) {
        try {
            if (channel instanceof GuildChannel && channel instanceof TextChannel) {
                const connection = databaseService.connectionFactory(channel.guildId, config.mongoose.dbURL);
                channelService.createChannel(connection, {
                    id: channel.id,
                    name: channel.name,
                    parent_id: channel.parentId
                })
                await closeConnection(connection)
            }
        } catch (err) {
            // TODO: improve error handling
            console.log(err);
        }
    },
};
