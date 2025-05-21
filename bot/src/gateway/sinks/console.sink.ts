import { EventSink } from './event.sink'
import { DiscordEventEnvelope } from '../../types/gateway.type'

export class ConsoleSink implements EventSink {
    async dispatch(envelope: DiscordEventEnvelope): Promise<void> {
        console.log(`[${new Date(envelope.ts).toISOString()}] shard:${envelope.shardId} ${envelope.type}`)
    }
}
