import 'dotenv/config';
import { Client, GatewayIntentBits, } from 'discord.js';
import { platformService } from '../../database/services';
import { connectDB } from '../../database';
import config from '../../config';
import webhookLogic from '../utils/webhookLogic';
import { DatabaseManager } from '@togethercrew.dev/db';

const { Guilds, GuildMembers, GuildMessages, GuildPresences, DirectMessages } = GatewayIntentBits;

export const up = async () => {
  const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages, GuildPresences, DirectMessages],
  });

    await client.login(config.discord.botToken);
    await connectDB();
    const platforms = await platformService.getPlatforms({});
    for (let i = 0; i < platforms.length; i++) {
        const connection = DatabaseManager.getInstance().getTenantDb(platforms[i].metadata?.id);
        await webhookLogic(connection, client, platforms[i].metadata?.id);
    }
};

export const down = async () => {
  // TODO: Implement rollback logic if needed
};
