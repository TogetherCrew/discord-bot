// src/app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { LoggerModule } from 'nestjs-pino'
import { configModules, configValidationSchema } from './config'
import { RabbitMQModule } from './rabbitmq/rabbitmq.module'
import { pinoConfig } from './config/pino.config'
import { mongooseConfig } from './config/mongoose.config'
import { HivemindAdapterModule } from './hivemind-adapter/adapter.module'
import { BotAdapterModule } from './bot-adapter/bot.adapter.module'
import { PlatformModule } from './platform/platform.module'

mongooseConfig
@Module({
    imports: [
        ConfigModule.forRoot({
            load: configModules,
            validationSchema: configValidationSchema,
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: mongooseConfig,
            inject: [ConfigService],
        }),
        LoggerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: pinoConfig,
        }),
        RabbitMQModule,
        HivemindAdapterModule,
        BotAdapterModule,
        PlatformModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
