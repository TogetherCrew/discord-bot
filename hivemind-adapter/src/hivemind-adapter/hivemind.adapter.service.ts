// src/hivemind-adapter/hivemind.adapter.service.ts
import { Injectable } from '@nestjs/common'
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino'
import { RabbitMQService } from '../rabbitmq/rabbitmq.service'
import { Question } from '../common/interfaces/hivemind.interface'
import { Event, Queue } from '@togethercrew.dev/tc-messagebroker'
import { ChatInputCommandInteraction_broker, InteractionEditResponse } from '../common/interfaces/bot.interface'

@Injectable()
export class HivemindAdapterService {
    constructor(
        private readonly rabbitMQService: RabbitMQService,
        @InjectPinoLogger(HivemindAdapterService.name)
        private readonly logger: PinoLogger
    ) {}

    onModuleInit() {
        this.registerEvents()
    }

    registerEvents() {
        this.rabbitMQService.onEvent(
            Event.DISCORD_HIVEMIND_ADAPTER.QUESTION_RESPONSE_RECEIVED,
            this.handleQuestionResponseReceivedEvent.bind(this)
        )
    }
    async handleQuestionResponseReceivedEvent(msg: Record<string, any>) {
        try {
            this.logger.info(msg, `processing QUESTION_RESPONSE_RECEIVED event`)
            const question = msg?.content
            const data = this.adaptDataToBot(question)
            this.rabbitMQService.publish(Queue.DISCORD_BOT, Event.DISCORD_BOT.INTERACTION_RESPONSE.EDIT, { ...data })
            this.logger.info(data, `QUESTION_RESPONSE_RECEIVED event is processed`)
        } catch (err) {
            this.logger.error(msg, 'handleQuestionResponseReceivedEvent Failed')
            this.logger.error(err, 'handleQuestionResponseReceivedEvent Failed')
        }
    }

    private adaptDataToBot(question: Question): {
        interaction: ChatInputCommandInteraction_broker
        data: InteractionEditResponse
    } {
        return {
            interaction: question.metadata.interaction,
            data: {
                content: `${question.question.message}: ${question.response.message}`,
            },
        }
    }
}
