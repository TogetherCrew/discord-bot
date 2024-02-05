import mongoose from 'mongoose'
import config from '../config'
import { MBConnection } from '@togethercrew.dev/tc-messagebroker'
import logger from '../config/logger'

mongoose.set('strictQuery', true)

// Connect to Message Broker DB
export const connectToMB = async (): Promise<void> => {
  try {
    MBConnection.connect(config.mongoose.dbURL)
    logger.info(
      { url: config.mongoose.dbURL },
      'Setuped Message Broker connection!'
    )
  } catch (error) {
    logger.fatal(
      { url: config.mongoose.dbURL, error },
      'Failed to setup to Message Broker!!'
    )
  }
}

// Connect to MongoDB
export const connectToMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoose.serverURL)
    logger.info({ url: config.mongoose.serverURL }, 'Connected to MongoDB!')
  } catch (error) {
    logger.fatal(
      { url: config.mongoose.serverURL, error },
      'Failed to connect to MongoDB!'
    )
  }
}
