import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger } from 'nestjs-pino'

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule)
    const logger = app.get(Logger)
    logger.log('App is running....')
}
bootstrap()
