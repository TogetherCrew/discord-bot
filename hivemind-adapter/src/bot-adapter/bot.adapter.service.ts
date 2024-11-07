// src/bot-adapter/bot.adapter.service.ts
import { Injectable } from '@nestjs/common'
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino'
import { RabbitMQService } from '../rabbitmq/rabbitmq.service'
import { Event, Queue } from '@togethercrew.dev/tc-messagebroker'
import { Question } from '../common/interfaces/hivemind.interface'
import { ChatInputCommandInteraction_broker } from '../common/interfaces/bot.interface'
import { PlatformService } from '../platform/platform.service'
import { PlatformNames } from '@togethercrew.dev/db'
import { Types } from 'mongoose'

@Injectable()
export class BotAdapterService {
    constructor(
        private readonly rabbitMQService: RabbitMQService,
        private readonly platformService: PlatformService,
        @InjectPinoLogger(BotAdapterService.name)
        private readonly logger: PinoLogger
    ) {}

    onModuleInit() {
        this.registerEvents()
    }
    private registerEvents() {
        this.rabbitMQService.onEvent(
            Event.DISCORD_HIVEMIND_ADAPTER.QUESTION_COMMAND_RECEIVED,
            this.handleQuestionCommandReceivedEvent.bind(this)
        )
    }
    async handleQuestionCommandReceivedEvent(msg: Record<string, any>) {
        this.logger.info(msg, `processing QUESTION_COMMAND_RECEIVED event`)
        const interaction = msg?.content.interaction
        const platform = await this.platformService.getPlatform({
            'metadata.id': interaction.guildId,
        })
        const data = this.adaptDataToHivemind(interaction, platform.community)
        this.rabbitMQService.publish(Queue.HIVEMIND, Event.HIVEMIND.QUESTION_RECEIVED, { ...data })
        this.logger.info(data, `QUESTION_COMMAND_RECEIVED event is processed`)
    }

    private adaptDataToHivemind(
        interaction: ChatInputCommandInteraction_broker,
        communityId: Types.ObjectId
    ): Question {
        return {
            communityId,
            route: {
                source: PlatformNames.Discord,
                destination: {
                    queue: Queue.DISCORD_HIVEMIND_ADAPTER,
                    event: Event.DISCORD_HIVEMIND_ADAPTER.QUESTION_COMMAND_RECEIVED,
                },
            },
            question: {
                message: interaction.options._hoistedOptions[0].value,
            },
            metadata: {
                interaction,
            },
        }
    }
}
