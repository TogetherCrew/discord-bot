import { Client, Events } from 'discord.js'
import { once } from 'events'

import config from '../config'

export class DiscordBotManager {
    private static instance: DiscordBotManager
    private client?: Client
    private readyPromise?: Promise<void>
    private initPromise?: Promise<Client>

    private constructor() {}

    public static getInstance(): DiscordBotManager {
        if (!DiscordBotManager.instance) {
            DiscordBotManager.instance = new DiscordBotManager()
        }
        return DiscordBotManager.instance
    }

    public async getClient(): Promise<Client> {
        if (this.client && this.readyPromise) {
            await this.readyPromise
            return this.client
        }

        if (this.initPromise) {
            return this.initPromise
        }

        this.initPromise = (async () => {
            this.client = new Client({
                intents: config.discord.intents,
                partials: config.discord.partials,
            })

            this.readyPromise = once(this.client, Events.ClientReady).then(() => {})

            await this.client.login(config.discord.botToken)

            await this.readyPromise

            return this.client!
        })()
        return this.initPromise
    }

    public async login(): Promise<Client> {
        return this.getClient()
    }
}

export default {
    DiscordBotManager,
}
