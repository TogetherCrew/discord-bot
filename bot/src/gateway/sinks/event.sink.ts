import { GatewayDispatchPayload } from 'discord-api-types/v10';

export interface EventSink {
    dispatch(payload: GatewayDispatchPayload): Promise<void>
}
