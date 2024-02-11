import config from './index';

export const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

export const cronJobConfig = {
  cron: '0 0 * * *', // Run once at 00:00 UTC
  jobId: 'cronJob',
  attempts: 0,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
};

export const rateLimitConfig = {
  max: 20,
  duration: 10000,
};

export const discordEventConfig = {
  attempts: 1,
  max: 10,
  duration: 10000,
};
