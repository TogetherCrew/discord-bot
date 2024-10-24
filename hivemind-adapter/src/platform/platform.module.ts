// src/platform/platform.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { platformSchema } from '@togethercrew.dev/db'
import { PlatformService } from './platform.service'

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Platform', schema: platformSchema }])],
    providers: [PlatformService],
    exports: [PlatformService],
})
export class PlatformModule {}
