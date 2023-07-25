import { Events, GuildMember } from 'discord.js';
import { guildMemberService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';

export default {
    name: Events.GuildMemberRemove,
    once: false,
    async execute(member: GuildMember) {
        try {
            const connection = databaseService.connectionFactory(member.guild.id, config.mongoose.dbURL);
            const guildMemberDoc = await guildMemberService.getGuildMember(connection, { discordId: member.user.id });
            await guildMemberDoc?.softDelete();
            await closeConnection(connection)

        } catch (err) {
            // TODO: improve error handling
            console.log(err);
        }
    },
};
