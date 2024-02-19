import Pyroscope from '@pyroscope/nodejs';
import config from './index';
import logger from './logger';

export default function pyroscope(): void {
  try {
    Pyroscope.init({ serverAddress: config.pyroscope.uri, appName: 'discord' });
    Pyroscope.start();
  } catch (err) {
    logger.warn(err);
  }
}
