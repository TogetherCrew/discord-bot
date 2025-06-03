import { GatewayDispatchPayload } from 'discord-api-types/v10'

import parentLogger from '../config/logger'
import { EventSink } from './sinks/event.sink'

const logger = parentLogger.child({ module: `Gateway:EventRouter` })
export class EventRouter {
    constructor(private readonly sink: EventSink) {}

    onGatewayDispatch(payload: GatewayDispatchPayload) {
        this.sink.dispatch(payload).catch((err) => logger.error('[EventSink]', { err }))
    }
}
