import { EventSink } from './sinks/event.sink'
import { DiscordEventEnvelope, EventPayloadMap } from '../types/gateway.type'

export class EventRouter {
    constructor(private readonly sink: EventSink) {}

    onGatewayDispatch<K extends keyof EventPayloadMap>(type: K, data: EventPayloadMap[K], shardId: number) {
        const envelope: DiscordEventEnvelope<K> = {
            type,
            data,
            shardId,
            ts: Date.now(),
        }

        this.sink.dispatch(envelope).catch((err) => console.error('[EventSink]', { err, envelopeType: type }))
    }
}
