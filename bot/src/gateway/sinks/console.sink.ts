import parentLogger from '../../config/logger';
import { DiscordEventEnvelope } from '../../types/gateway.type';
import { EventSink } from './event.sink';

const logger = parentLogger.child({ component: 'Gateway:ConsoleSink' })

export class ConsoleSink implements EventSink {
    async dispatch(envelope: DiscordEventEnvelope): Promise<void> {
        logger.info(`[${new Date(envelope.ts).toISOString()}] shard:${envelope.shardId} ${envelope.type}`)
    }
}
