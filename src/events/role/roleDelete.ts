import { Events, Role } from 'discord.js';
import { roleService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';

export default {
    name: Events.GuildRoleDelete,
    once: false,
    async execute(role: Role) {
        try {
            const connection = databaseService.connectionFactory(role.guild.id, config.mongoose.dbURL);
            const roleDoc = await roleService.getRole(connection, { roleId: role.id });
            await roleDoc?.softDelete();
            await closeConnection(connection)

        } catch (err) {
            // TODO: improve error handling
            console.log(err);
        }
    },
};
