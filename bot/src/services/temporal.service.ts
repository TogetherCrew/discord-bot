import { Client as TemporalClient, Connection } from '@temporalio/client';

import config from '../config';

export class TemporalClientManager {
    private static instance: TemporalClientManager
    private client?: TemporalClient
    private initPromise?: Promise<TemporalClient>

    private constructor() {}

    public static getInstance(): TemporalClientManager {
        if (!TemporalClientManager.instance) {
            TemporalClientManager.instance = new TemporalClientManager()
        }
        return TemporalClientManager.instance
    }

    public async getClient(): Promise<TemporalClient> {
        if (this.client) {
            return this.client
        }

        if (this.initPromise) {
            return this.initPromise
        }

        this.initPromise = (async () => {
            const connection = await Connection.connect({
                address: config.temporal.uri,
            })

            this.client = new TemporalClient({ connection })
            return this.client
        })()

        return this.initPromise
    }

    public async connect(): Promise<TemporalClient> {
        return this.getClient()
    }
}

export default {
    TemporalClientManager,
}
