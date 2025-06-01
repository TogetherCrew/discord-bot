import { GatewayDispatchPayload } from 'discord-api-types/v10';

import { WebSocketManager, WebSocketShardEvents } from '@discordjs/ws';

import parentLogger from '../config/logger';
import { isAllowedEvent } from './allowedEvents';
import { EventRouter } from './eventRouter';
import { createGatewayManager } from './manager';
import { EventSink } from './sinks/event.sink';

const logger = parentLogger.child({ module: `Gateway` })
export async function createGateway(token: string, sink: EventSink): Promise<WebSocketManager> {
    const router = new EventRouter(sink)
    const manager = createGatewayManager(token)

    manager.on(WebSocketShardEvents.Dispatch, (payload: GatewayDispatchPayload, shardId) => {
        if (isAllowedEvent(payload.t)) {
            router.onGatewayDispatch(
                payload,
                shardId
            )
        }
    })

    manager
        .on(WebSocketShardEvents.Ready, (shard) => logger.info(`✅  Shard ready`))
        .on(WebSocketShardEvents.Closed, (shard) => logger.warn(`⚠️  Shard closed`))

    await manager.connect()

    process.once('SIGINT', async () => {
        logger.info('SIGINT → closing shards …')
        await manager.destroy()
        process.exit(0)
    })

    return manager
}
