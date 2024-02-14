import config from './index';

export const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

export const cronJobConfig = {
  // cron: '0 0 * * *', // Run once at 00:00 UTC
  cron: '15 20 * * *',
  jobId: 'cronJob',
  attempts: 0,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
};

export const rateLimitConfig = {
  max: 20,
  duration: 20000, // millisecond
};

export const guildEventConfig = {
  attempts: 1,
  max: 5,
  duration: 20000,
};

export const userEventConfig = {
  attempts: 1,
  max: 1,
  duration: 20000,
};

export const guildExtractionConfig = {
  attempts: 1,
  max: 1,
  duration: 3600,
};
