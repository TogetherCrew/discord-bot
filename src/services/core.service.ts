import { Client, GatewayIntentBits } from 'discord.js';
import config from '../config';

class DiscordBotManager {
    public static client: Client;
    public static async getClient(): Promise<Client> {
        if (!DiscordBotManager.client) {
            DiscordBotManager.client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.GuildPresences,
                    GatewayIntentBits.DirectMessages,
                ],
            });
            await DiscordBotManager.client.login(config.discord.botToken);

        }
        return DiscordBotManager.client;
    }

    public static async initClient(): Promise<Client> {
        DiscordBotManager.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.DirectMessages,
            ],
        });

        return DiscordBotManager.client;
    }

    public static async LoginClient(): Promise<Client> {
        await DiscordBotManager.client.login(config.discord.botToken);
        return DiscordBotManager.client;
    }

}


export default {
    DiscordBotManager
} 