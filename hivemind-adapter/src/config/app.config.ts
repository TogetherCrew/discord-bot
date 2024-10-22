import { registerAs } from '@nestjs/config'
import * as Joi from 'joi'

export default registerAs('app', () => ({
    nodeEnv: process.env.NODE_ENV,
}))

export const appConfigSchema = {
    NODE_ENV: Joi.string()
        .valid('production', 'development', 'test')
        .required()
        .description('Application environment'),
}
