import Pyroscope from '@pyroscope/nodejs';
import config from './index';
import logger from './logger';

export default function pyroscope(): void {
  try {
    Pyroscope.init({ serverAddress: config.pyroscope.address, appName: 'discord' });
    Pyroscope.start();
    logger.info({ url: config.pyroscope.address }, 'Connected to pyroscope.')
  } catch (error) {
    logger.fatal({ url: config.pyroscope.address, error }, 'Failed to connect to pyroscope.');
  }
}
