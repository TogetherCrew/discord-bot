import * as Joi from 'joi'
import rabbitmqConfig, { rabbitmqConfigSchema } from '../rabbitmq/config/rabbitmq.config'
import appConfig, { appConfigSchema } from './app.config'
import loggerConfig, { loggerConfigSchema } from './logger.config'
import mongoDBConfig, { mongoDBConfigSchema } from './mongoDB.config'

export const configModules = [appConfig, rabbitmqConfig, loggerConfig, mongoDBConfig]

export const configValidationSchema = Joi.object({
    ...appConfigSchema,
    ...rabbitmqConfigSchema,
    ...loggerConfigSchema,
    ...mongoDBConfigSchema,
})
