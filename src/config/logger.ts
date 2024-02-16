import pino from 'pino';
import config from './index';

export default pino({
  level: config.logger.level,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
});
