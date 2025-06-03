import { IntentsBitField } from 'discord.js'

import { REST } from '@discordjs/rest'
import { WebSocketManager } from '@discordjs/ws'

import config from '../config'

export function createGatewayManager(token: string) {
    const rest = new REST().setToken(token)
    return new WebSocketManager({
        token,
        intents: IntentsBitField.resolve(config.discord.intents),
        rest,
        // compression: CompressionMethod.ZlibSync,
    })
}
