import { GatewayDispatchPayload } from 'discord-api-types/v10'

import parentLogger from '../../config/logger'
import { TemporalClientManager } from '../../services/temporal.service'
import { EventSink } from './event.sink'

const logger = parentLogger.child({ component: 'Gateway:TemporalSink' })

export class TemporalSink implements EventSink {
    async dispatch(payload: GatewayDispatchPayload): Promise<void> {
        try {
            console.log('payload', payload)

            const client = await TemporalClientManager.getInstance().getClient()
            const workflowId = `discord:gateway:${payload.t}}`
            await client.workflow.start('DiscordGatewayEventWorkflow', {
                taskQueue: 'TEMPORAL_QUEUE_HEAVY',
                args: [payload],
                workflowId,
            })

            logger.info(
                {
                    workflowId,
                },
                'Gateway event workflow started'
            )
        } catch (error) {
            logger.error(
                {
                    error,
                },
                'Failed to start gateway event workflow'
            )
        }
    }
}
