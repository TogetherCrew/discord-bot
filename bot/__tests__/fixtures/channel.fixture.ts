import { IChannel } from '@togethercrew.dev/db'
import { Connection } from 'mongoose'

export const channel1: IChannel = {
    channelId: '987654321098765432',
    name: 'Channel 1',
    parentId: null,
    permissionOverwrites: [
        {
            id: '1122334455', // example Snowflake ID for the role or member
            type: 0,
            allow: 'VIEW_CHANNEL',
            deny: 'SEND_MESSAGES',
        },
        {
            id: '9988776655', // another example Snowflake ID for the role or member
            type: 1,
            allow: 'VIEW_CHANNEL,SEND_MESSAGES',
            deny: '',
        },
    ],
    type: 0,
}

export const channel2: IChannel = {
    channelId: '234567890123456789',
    name: 'Channel 2',
    parentId: '987654321098765432',
    type: 0,
}

export const channel3: IChannel = {
    channelId: '345678901234567890',
    name: 'Channel 3',
    parentId: '987654321098765432',
    type: 0,
}

export const insertChannels = async function <Type>(
    channels: Array<Type>,
    connection: Connection
) {
    await connection.models.Channel.insertMany(
        channels.map((channel) => channel)
    )
}
