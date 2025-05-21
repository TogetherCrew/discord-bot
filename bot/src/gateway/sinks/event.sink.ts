import { DiscordEventEnvelope, EventPayloadMap } from '../../types/gateway.type'

export interface EventSink {
    dispatch<K extends keyof EventPayloadMap>(envelope: DiscordEventEnvelope<K>): Promise<void>
}
