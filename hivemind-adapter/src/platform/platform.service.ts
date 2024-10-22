// src/platform/platform.service.ts
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, HydratedDocument, FilterQuery } from 'mongoose'

import { IPlatform } from '@togethercrew.dev/db'

@Injectable()
export class PlatformService {
    constructor(
        @InjectModel('Platform') private platformModel: Model<IPlatform>
    ) {}

    async getPlatform(
        filter: FilterQuery<IPlatform>
    ): Promise<HydratedDocument<IPlatform> | null> {
        return this.platformModel.findOne(filter)
    }
}
