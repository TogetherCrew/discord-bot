import { WebSocketManager } from '@discordjs/ws'
import { REST } from '@discordjs/rest'
import { GatewayIntentBits, Routes } from 'discord-api-types/v10'

const INTENTS =
    GatewayIntentBits.GuildMembers |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.GuildMessageReactions |
    GatewayIntentBits.MessageContent |
    GatewayIntentBits.Guilds

export function createGatewayManager(token: string) {
    const rest = new REST().setToken(token)

    return new WebSocketManager({
        token,
        intents: INTENTS,
        rest,
        // Uncomment to let Discord tell you optimal shard-count:
        // async fetchGatewayInformation() {
        //   return rest.get(Routes.gatewayBot());
        // },
        // Example: two shards per worker
        // buildStrategy: m => new WorkerShardingStrategy(m, { shardsPerWorker: 2 }),
        // Enable Zlib if `zlib-sync` is installed
        // compression: 'zlib-stream',
    })
}
