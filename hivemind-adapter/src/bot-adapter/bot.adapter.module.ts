// src/bot-adapter/bot.adapter.module.ts
import { Module } from '@nestjs/common'
import { BotAdapterService } from './bot.adapter.service'
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module'
import { PlatformModule } from '../platform/platform.module'

@Module({
    imports: [RabbitMQModule, PlatformModule],
    providers: [BotAdapterService],
    exports: [],
})
export class BotAdapterModule {}
