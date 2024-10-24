import { Client, GatewayIntentBits, Partials } from 'discord.js'
import config from '../config'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class DiscordBotManager {
    public static client: Client
    public static async getClient(): Promise<Client> {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!DiscordBotManager.client) {
            DiscordBotManager.client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.GuildPresences,
                    GatewayIntentBits.DirectMessages,
                    GatewayIntentBits.MessageContent,
                    GatewayIntentBits.DirectMessageReactions,
                    GatewayIntentBits.DirectMessages,
                ],
                partials: [Partials.Channel],
            })
            await DiscordBotManager.client.login(config.discord.botToken)
        }
        return DiscordBotManager.client
    }

    public static async initClient(): Promise<Client> {
        DiscordBotManager.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessages,
            ],
            partials: [Partials.Channel],
        })

        return DiscordBotManager.client
    }

    public static async LoginClient(): Promise<Client> {
        await DiscordBotManager.client.login(config.discord.botToken)
        return DiscordBotManager.client
    }
}

export default {
    DiscordBotManager,
}
