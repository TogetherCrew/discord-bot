// src/rabbitmq/rabbitmq.module.ts
import { Module } from '@nestjs/common'
import { RabbitMQService } from './rabbitmq.service'

@Module({
    imports: [],
    providers: [RabbitMQService],
    exports: [RabbitMQService],
})
export class RabbitMQModule {}
