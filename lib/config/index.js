"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const envVarsSchema = joi_1.default.object()
    .keys({
    NODE_ENV: joi_1.default.string().valid('production', 'development', 'test').required(),
    DB_HOST: joi_1.default.string().required().description('Mongo DB url'),
    DB_PORT: joi_1.default.string().required().description('Mongo DB port'),
    DB_USER: joi_1.default.string().required().description('Mongo DB username'),
    DB_PASSWORD: joi_1.default.string().required().description('Mongo DB password'),
    DB_NAME: joi_1.default.string().required().description('Mongo DB name'),
    RABBIT_HOST: joi_1.default.string().required().description('RabbitMQ url'),
    RABBIT_PORT: joi_1.default.string().required().description('RabbitMQ port'),
    RABBIT_USER: joi_1.default.string().required().description('RabbitMQ username'),
    RABBIT_PASSWORD: joi_1.default.string().required().description('RabbitMQ password'),
    DISCROD_CLIENT_ID: joi_1.default.string().required().description('Discord clinet id'),
    DISCORD_CLIENT_SECRET: joi_1.default.string().required().description('Discord clinet secret'),
    DISCORD_BOT_TOKEN: joi_1.default.string().required().description('Discord bot token'),
    SENTRY_DSN: joi_1.default.string().required().description('Sentry DSN'),
    SENTRY_ENV: joi_1.default.string().valid('production', 'development', 'local', 'test').required(),
    REDIS_HOST: joi_1.default.string().required().description('Reids host'),
    REDIS_PORT: joi_1.default.string().required().description('Reids port'),
    REDIS_PASSWORD: joi_1.default.string().required().description('Reids password').allow(''),
    LOG_LEVEL: joi_1.default.string().required().description('Min allowed log level'),
})
    .unknown();
const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
exports.default = {
    env: envVars.NODE_ENV,
    mongoose: {
        serverURL: `mongodb://${envVars.DB_USER}:${envVars.DB_PASSWORD}@${envVars.DB_HOST}:${envVars.DB_PORT}/${envVars.DB_NAME}`,
        dbURL: `mongodb://${envVars.DB_USER}:${envVars.DB_PASSWORD}@${envVars.DB_HOST}:${envVars.DB_PORT}`,
    },
    redis: {
        host: envVars.REDIS_HOST,
        port: envVars.REDIS_PORT,
        password: envVars.REDIS_PASSWORD,
    },
    rabbitMQ: {
        url: `amqp://${envVars.RABBIT_USER}:${envVars.RABBIT_PASSWORD}@${envVars.RABBIT_HOST}:${envVars.RABBIT_PORT}`,
    },
    discord: {
        clientId: envVars.DISCROD_CLIENT_ID,
        clientSecret: envVars.DISCORD_CLIENT_SECRET,
        botToken: envVars.DISCORD_BOT_TOKEN,
    },
    sentry: {
        dsn: envVars.SENTRY_DSN,
        env: envVars.SENTRY_ENV,
    },
    logger: {
        level: envVars.LOG_LEVEL,
    },
};
