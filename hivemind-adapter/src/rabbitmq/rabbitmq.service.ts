// src/rabbitmq/rabbitmq.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common'
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino'
import { ConfigService } from '@nestjs/config'
import RabbitMQ, { Queue } from '@togethercrew.dev/tc-messagebroker'

@Injectable()
export class RabbitMQService implements OnModuleInit {
    private readonly rabbitMQ = RabbitMQ
    private readonly url: string
    private readonly queue: Queue

    constructor(
        private readonly configService: ConfigService,
        @InjectPinoLogger(RabbitMQService.name)
        private readonly logger: PinoLogger
    ) {
        const host = this.configService.get<string>('rabbitMQ.host')
        const port = this.configService.get<string>('rabbitMQ.port')
        const user = this.configService.get<string>('rabbitMQ.user')
        const password = this.configService.get<string>('rabbitMQ.password')
        this.url = `amqp://${user}:${password}@${host}:${port}`
        this.queue = Queue.DISCORD_HIVEMIND_ADAPTER
    }

    async onModuleInit() {
        await this.connect(this.url, this.queue)
    }

    async onModuleDestroy() {}

    async connect(url: string, queue: string) {
        try {
            await this.rabbitMQ.connect(url, queue)
            this.logger.info(`RabbitMQ connected`)
        } catch (err) {
            this.logger.error(err, `Failed to connect to RabbitMQ`)
        }
    }

    disconnect() {}

    publish(queue: Queue, event: string, content: any) {
        this.rabbitMQ.publish(queue, event, content)
    }

    onEvent(event: string, handler: (msg: any) => void) {
        this.rabbitMQ.onEvent(event, handler)
    }
}
