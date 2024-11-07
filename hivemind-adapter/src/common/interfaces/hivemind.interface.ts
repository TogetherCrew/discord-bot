import { Types } from 'mongoose'
import { PlatformNames } from '@togethercrew.dev/db'
import { Queue } from '@togethercrew.dev/tc-messagebroker'

export interface Question {
    communityId: string
    route: {
        source: PlatformNames
        destination: {
            queue: Queue
            event: string
        }
    }
    question: {
        message: string
        filters?: Record<string, any>
    }
    response?: {
        message: string
    }
    metadata: Record<string, any>
}
