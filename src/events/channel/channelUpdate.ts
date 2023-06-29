import { Events, Channel, GuildChannel, TextChannel } from 'discord.js';
import { channelService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';

export default {
    name: Events.ChannelUpdate,
    once: false,
    async execute(oldChannel: Channel, newChannel: Channel) {
        try {
            if (oldChannel instanceof GuildChannel && oldChannel instanceof TextChannel && newChannel instanceof GuildChannel && newChannel instanceof TextChannel) {
                const connection = databaseService.connectionFactory(oldChannel.guildId, config.mongoose.dbURL);
                const channel = await channelService.updateChannel(connection,
                    { id: oldChannel.id },
                    { name: newChannel.name, parentId: newChannel.parentId }
                );
                if (!channel) {
                    channelService.createChannel(connection, {
                        channelId: newChannel.id,
                        name: newChannel.name,
                        parentId: newChannel.parentId
                    })
                }
                await closeConnection(connection)
            }
        } catch (err) {
            // TODO: improve error handling
            console.log(err);
        }
    },
};
