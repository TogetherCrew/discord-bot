// global.d.ts
import { type Collection } from 'discord.js'

declare module 'discord.js' {
    interface Client {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        commands: Collection<string, any>
    }
}
