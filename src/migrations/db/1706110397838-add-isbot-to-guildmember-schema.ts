import 'dotenv/config';
import { connectToMongoDB } from '../../database/connection';
import isBotLogic from '../utils/isBotLogic';
import { DatabaseManager } from '@togethercrew.dev/db';
import { Client, GatewayIntentBits } from 'discord.js';
import config from '../../config';
const { Guilds, GuildMembers, GuildMessages, GuildPresences, DirectMessages } = GatewayIntentBits;
import { coreService } from '../../services';

export const up = async () => {
  // await coreService.DiscordBotManager.initClient();
  // await coreService.DiscordBotManager.LoginClient();
  // await connectToMongoDB();
  // const connection1 = await DatabaseManager.getInstance().getTenantDb('1023936505321881641');
  // const connection2 = await DatabaseManager.getInstance().getTenantDb('949124961187016764');
  // await isBotLogic(connection1, client, '1023936505321881641');
  // await isBotLogic(connection2, client, '949124961187016764');
};

export const down = async () => {
  // TODO: Implement rollback logic if needed
};
