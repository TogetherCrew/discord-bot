import { ConfigService } from '@nestjs/config'
export const mongooseConfig = (configService: ConfigService) => {
    const host = configService.get('mongoDB.host')
    const port = configService.get('mongoDB.port')
    const user = configService.get('mongoDB.user')
    const password = configService.get('mongoDB.password')
    const dbName = configService.get('mongoDB.dbName')
    return {
        uri: `mongodb://${user}:${password}@${host}:${port}/${dbName}?authSource=admin`,
    }
}
