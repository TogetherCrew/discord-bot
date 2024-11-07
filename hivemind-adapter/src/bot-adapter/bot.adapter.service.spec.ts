// src/bot-adapter/bot.adapter.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { LoggerModule } from 'nestjs-pino'
import { RabbitMQService } from '../rabbitmq/rabbitmq.service'
import { BotAdapterService } from './bot.adapter.service'
import { PlatformService } from '../platform/platform.service'

const mockRabbitMQHost = 'mock-rabbitmq-host'
const mockRabbitMQPort = 'mock-rabbitmq-port'
const mockRabbitMQUser = 'mock-rabbitmq-user'
const mockRabbitMQPassword = 'mock-rabbitmq-password'

const mockRabbitMQService = {
    get: jest.fn((key: string) => {
        if (key === 'rabbitMQ.host') return mockRabbitMQHost
        if (key === 'rabbitMQ.port') return mockRabbitMQPort
        if (key === 'rabbitMQ.user') return mockRabbitMQUser
        if (key === 'rabbitMQ.password') return mockRabbitMQPassword
    }),
}

describe('BotAdapterService', () => {
    let service: BotAdapterService
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [LoggerModule.forRoot()],
            providers: [
                BotAdapterService,
                PlatformService,
                { provide: RabbitMQService, useValue: mockRabbitMQService },
            ],
        }).compile()

        service = module.get<BotAdapterService>(BotAdapterService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
