// src/hivemind-adapter/hivemind.adapter.module.ts
import { Module } from '@nestjs/common'
import { HivemindAdapterService } from './hivemind.adapter.service'
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module'

@Module({
    imports: [RabbitMQModule],
    providers: [HivemindAdapterService],
    exports: [],
})
export class HivemindAdapterModule {}
