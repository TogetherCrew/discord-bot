import { ChannelType, TextChannel } from 'discord.js'
import { connection, Connection, HydratedDocument } from 'mongoose'

import { IPlatform, makeThreadRepository } from '@togethercrew.dev/db'

import config from '../config'
import parentLogger from '../config/logger'

const logger = parentLogger.child({ module: 'Thread' })

export async function createPrivateThreadAndSendMessage(
    channel: TextChannel,
    info: { threadName: string; message: string; threadReason?: string }
) {
    const { threadName, message, threadReason } = info
    const thread = await channel.threads.create({
        name: threadName,
        reason: threadReason,
        type: ChannelType.PrivateThread,
        invitable: false,
    })

    await thread.send(message)

    return thread
}

export async function getActiveThreads(connection: Connection, platform: HydratedDocument<IPlatform>): Promise<any> {
    const response = await fetch(`https://discord.com/api/v10/guilds/${platform.metadata?.id}/threads/active`, {
        method: 'GET',
        headers: {
            Authorization: `Bot ${config.discord.botToken}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to get active threads: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()

    try {
        const repository = makeThreadRepository(connection)
        await repository.createMany(data.threads)
    } catch (err: any) {
        if (err.code === 11000) {
            logger.warn({ threadId: data.id }, 'Thread already exists')
        } else {
            logger.error({ err, threadId: data.id }, 'Failed to create thread')
            throw err
        }
    }
}

export async function getPublicArchivedThreads(connection: Connection, channelId: string): Promise<any> {
    let url = `https://discord.com/api/v10/channels/${channelId}/threads/archived/public`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bot ${config.discord.botToken}`,
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error(`Failed to get archived threads: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()

    try {
        const repository = makeThreadRepository(connection)
        await repository.createMany(data.threads)
    } catch (err: any) {
        if (err.code === 11000) {
            logger.warn({ threadId: data.id }, 'Thread already exists')
        } else {
            logger.error({ err, threadId: data.id }, 'Failed to create thread')
            throw err
        }
    }
}

export async function getPrivateArchivedThreads(connection: Connection, channelId: string): Promise<any> {
    let url = `https://discord.com/api/v10/channels/${channelId}/threads/archived/private`

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bot ${config.discord.botToken}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to get archived threads: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()

    try {
        const repository = makeThreadRepository(connection)
        await repository.createMany(data.threads)
    } catch (err: any) {
        if (err.code === 11000) {
            logger.warn({ threadId: data.id }, 'Thread already exists')
        } else {
            logger.error({ err, threadId: data.id }, 'Failed to create thread')
            throw err
        }
    }
}
