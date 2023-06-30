import { Events, Role } from 'discord.js';
import { roleService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';

export default {
    name: Events.GuildRoleCreate,
    once: false,
    async execute(role: Role) {
        console.log(role)
        try {
            const connection = databaseService.connectionFactory(role.guild.id, config.mongoose.dbURL);
            await roleService.createRole(connection, {
                roleId: role.id,
                name: role.name,
                color: role.color
            })
            await closeConnection(connection)

        } catch (err) {
            // TODO: improve error handling
            console.log(err);
        }
    },
};
