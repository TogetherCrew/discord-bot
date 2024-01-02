import 'dotenv/config';
import { Client, GatewayIntentBits, } from 'discord.js';
import { guildService } from '../../database/services';
import { connectDB } from '../../database';
import config from '../../config';
import DatabaseManager from '../../database/connection';
import webhookLogic from '../utils/webhookLogic';

const {
    Guilds,
    GuildMembers,
    GuildMessages,
    GuildPresences,
    DirectMessages
} = GatewayIntentBits;


export const up = async () => {
    const client = new Client({
        intents: [Guilds, GuildMembers, GuildMessages, GuildPresences, DirectMessages],
    });

    await client.login(config.discord.botToken);
    await connectDB();
    const guilds = await guildService.getGuilds({});
    for (let i = 0; i < guilds.length; i++) {
        const connection = DatabaseManager.getInstance().getTenantDb(guilds[i].guildId);
        await webhookLogic(connection, client, guilds[i].guildId);
    }
};

export const down = async () => {
    // TODO: Implement rollback logic if needed
};


