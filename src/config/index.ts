/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Joi from 'joi';

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    DB_HOST: Joi.string().required().description('Mongo DB url'),
    DB_PORT: Joi.string().required().description('Mongo DB port'),
    DB_USER: Joi.string().required().description('Mongo DB username'),
    DB_PASSWORD: Joi.string().required().description('Mongo DB password'),
    DB_NAME: Joi.string().required().description('Mongo DB name'),
    RABBIT_HOST: Joi.string().required().description('RabbitMQ url'),
    RABBIT_PORT: Joi.string().required().description('RabbitMQ port'),
    RABBIT_USER: Joi.string().required().description('RabbitMQ username'),
    RABBIT_PASSWORD: Joi.string().required().description('RabbitMQ password'),
    DISCORD_CLIENT_ID: Joi.string().required().description('Discord clinet id'),
    DISCORD_CLIENT_SECRET: Joi.string().required().description('Discord clinet secret'),
    DISCORD_BOT_TOKEN: Joi.string().required().description('Discord bot token'),
    SENTRY_DSN: Joi.string().required().description('Sentry DSN'),
    SENTRY_ENV: Joi.string().valid('production', 'development', 'local', 'test').required(),
    REDIS_HOST: Joi.string().required().description('Reids host'),
    REDIS_PORT: Joi.string().required().description('Reids port'),
    REDIS_PASSWORD: Joi.string().required().description('Reids password').allow(''),
    LOG_LEVEL: Joi.string().required().description('Min allowed log level'),
    PORT: Joi.number().default(3000),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error != null) {
  throw new Error(`Config validation error: ${error.message}`);
}
export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    serverURL: `mongodb://${envVars.DB_USER}:${envVars.DB_PASSWORD}@${envVars.DB_HOST}:${envVars.DB_PORT}/${envVars.DB_NAME}?authSource=admin`,
    dbURL: `mongodb://${envVars.DB_USER}:${envVars.DB_PASSWORD}@${envVars.DB_HOST}:${envVars.DB_PORT}?authSource=admin`,
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
    clientId: envVars.DISCORD_CLIENT_ID,
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
