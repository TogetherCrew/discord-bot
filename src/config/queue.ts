import config from './index';

export const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

export const cronJobRepeatConfig = {
  pattern: '45 22 * * *',
  attempts: 0,
};
