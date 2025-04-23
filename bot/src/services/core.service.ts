import { Client } from 'discord.js';

import config from '../config';

class DiscordBotManager {
    private static instance: DiscordBotManager
    private client?: Client
    private constructor() {}
    public static getInstance(): DiscordBotManager {
        if (!DiscordBotManager.instance) {
            DiscordBotManager.instance = new DiscordBotManager()
        }
        return DiscordBotManager.instance
    }
    public async getClient(): Promise<Client> {
        if (!this.client) {
            this.client = new Client({
                intents: config.discord.intents, 
                partials: config.discord.partials, 
            })
            await this.client.login(config.discord.botToken)
        }
        return this.client
    }

    public async login(): Promise<Client> {
        const client = await this.getClient()
        if (!client.isReady()) {
            await client.login(config.discord.botToken)
        }
        return client
    }
}

export default {
    DiscordBotManager,
}
