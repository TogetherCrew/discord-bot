import { Events, Role } from 'discord.js';
import { roleService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';

export default {
    name: Events.GuildRoleCreate,
    once: false,
    execute(role: Role) {
        console.log(role)
        try {
            const connection = databaseService.connectionFactory(role.guild.id, config.mongoose.dbURL);
            roleService.createRole(connection, {
                id: role.id,
                name: role.name,
                color: role.color
            })

        } catch (err) {
            // TODO: improve error handling
            console.log(err);
        }
    },
};
