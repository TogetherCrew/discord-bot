import { WebSocketManager, CompressionMethod } from '@discordjs/ws'
import { REST } from '@discordjs/rest'
import config from '../config'
import { IntentsBitField } from 'discord.js'

export function createGatewayManager(token: string) {
    const rest = new REST().setToken(token)
    return new WebSocketManager({
        token,
        intents: IntentsBitField.resolve(config.discord.intents),
        rest,
        compression: CompressionMethod.ZlibSync,
    })
}
