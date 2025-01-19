import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'

// src/bot-adapter/bot.adapter.service.ts
import { Injectable } from '@nestjs/common'
import { PlatformNames } from '@togethercrew.dev/db'
import { Event, Queue } from '@togethercrew.dev/tc-messagebroker'

import { ChatInputCommandInteraction_broker } from '../common/interfaces/bot.interface'
import { Question } from '../common/interfaces/hivemind.interface'
import { PlatformService } from '../platform/platform.service'
import { RabbitMQService } from '../rabbitmq/rabbitmq.service'

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
        try {
            this.logger.info(msg, `processing QUESTION_COMMAND_RECEIVED event`)
            const interaction = msg?.content.interaction
            const platform = await this.platformService.getPlatform({
                'metadata.id': interaction.guildId,
            })
            const data = this.adaptDataToHivemind(interaction, platform.community.toString())
            this.rabbitMQService.publish(Queue.HIVEMIND, Event.HIVEMIND.QUESTION_RECEIVED, { ...data })
            this.logger.info(data, `QUESTION_COMMAND_RECEIVED event is processed`)
        } catch (err) {
            this.logger.error(msg, 'handleQuestionCommandReceivedEvent Failed')
            this.logger.error(err, 'handleQuestionCommandReceivedEvent Failed')
        }
    }

    private adaptDataToHivemind(interaction: ChatInputCommandInteraction_broker, communityId: string): Question {
        return {
            communityId,
            route: {
                source: PlatformNames.Discord,
                destination: {
                    queue: Queue.DISCORD_HIVEMIND_ADAPTER,
                    event: Event.DISCORD_HIVEMIND_ADAPTER.QUESTION_RESPONSE_RECEIVED,
                },
            },
            question: {
                message: interaction.options._hoistedOptions[0].value,
            },
            metadata: {
                interaction,
                enableAnswerSkipping: false,
            },
        }
    }
}
