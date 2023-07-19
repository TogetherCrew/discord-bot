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
                await channelService.createChannel(connection, {
                    channelId: channel.id,
                    name: channel.name,
                    parentId: channel.parentId,
                    permissionOverwrites: Array.from(channel.permissionOverwrites.cache.values()).map(overwrite => ({
                        id: overwrite.id,
                        type: overwrite.type,
                        allow: overwrite.allow.bitfield.toString(),
                        deny: overwrite.deny.bitfield.toString(),
                    }))
                })
                await closeConnection(connection)
            }
        } catch (err) {
            // TODO: improve error handling
            console.log(err);
        }
    },
};
