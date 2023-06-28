import { Events, Role } from 'discord.js';
import { roleService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';

export default {
    name: Events.GuildRoleUpdate,
    once: false,
    async execute(oldRole: Role, newRole: Role) {
        try {
            const connection = databaseService.connectionFactory(oldRole.guild.id, config.mongoose.dbURL);
            const role = await roleService.updateRole(connection,
                { id: oldRole.id },
                { name: newRole.name, color: newRole.color }
            );
            if (!role) {
                roleService.createRole(connection, {
                    id: newRole.id,
                    name: newRole.name,
                    color: newRole.color
                })
            }
            await closeConnection(connection)

        } catch (err) {
            // TODO: improve error handling
            console.log(err);
        }
    },
};
