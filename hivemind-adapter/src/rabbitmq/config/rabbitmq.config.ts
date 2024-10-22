import { registerAs } from '@nestjs/config'
import * as Joi from 'joi'

export default registerAs('rabbitMQ', () => ({
    host: process.env.RABBITMQ_HOST,
    port: process.env.RABBITMQ_PORT,
    user: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
}))

export const rabbitmqConfigSchema = {
    RABBITMQ_HOST: Joi.string().required().description('RabbitMQ host'),
    RABBITMQ_PORT: Joi.string().required().description('RabbitMQ port'),
    RABBITMQ_USER: Joi.string().required().description('RabbitMQ user'),
    RABBITMQ_PASSWORD: Joi.string().required().description('RabbitMQ password'),
}
