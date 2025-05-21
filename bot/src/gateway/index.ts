import { WebSocketManager, WebSocketShardEvents } from '@discordjs/ws'
import { GatewayDispatchPayload } from 'discord-api-types/v10'
import { createGatewayManager } from './manager'
import { EventRouter } from './eventRouter'
import { EventSink } from './sinks/event.sink'
import { isAllowedEvent } from './allowedEvents'

export async function createGateway(token: string, sink: EventSink): Promise<WebSocketManager> {
    const router = new EventRouter(sink)
    const manager = createGatewayManager(token)

    manager.on(WebSocketShardEvents.Dispatch, (payload: GatewayDispatchPayload, shardId) => {
        console.log(payload.t)
        if (isAllowedEvent(payload.t)) {
            console.log(payload.t, payload.d)
            // TS now infers the correct literal type for payload.t & payload.d
            // router.onGatewayDispatch(payload.t, payload.d, shardId)
        }
    })

    manager
        .on(WebSocketShardEvents.Ready, (shardId) => console.info(`✅  Shard #${shardId} ready`))
        .on(WebSocketShardEvents.Closed, (shardId) => console.warn(`⚠️  Shard #${shardId} closed`))

    await manager.connect()

    process.once('SIGINT', async () => {
        console.info('SIGINT → closing shards …')
        await manager.destroy()
        process.exit(0)
    })

    return manager
}
