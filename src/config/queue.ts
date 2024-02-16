import config from './index';

export const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

export const cronJobConfig = {
  cron: '30 9 * * *', // Run once at 09:30 UTC (12:30 PM Iran time)
  jobId: 'cronJob',
  attempts: 0,
  max: 1,
  duration: 60000000,
};

export const rateLimitConfig = {
  max: 20,
  duration: 100000, // millisecond
};

export const guildEventConfig = {
  attempts: 1,
  max: 10,
  duration: 100000,
};

export const userEventConfig = {
  attempts: 1,
  max: 1,
  duration: 100000,
};

export const guildExtractionConfig = {
  attempts: 1,
  max: 1,
  duration: 6000000,
};
