import { Connection } from 'mongoose'
import { IChannelUpdateBody, DatabaseManager } from '@togethercrew.dev/db'
import setupTestDB from '../../../utils/setupTestDB'
import { channel1, channel2, channel3, insertChannels } from '../../../fixtures/channel.fixture'
import { channelService } from '../../../../src/database/services'
setupTestDB()

describe('channel service', () => {
    let connection: Connection
    beforeAll(async () => {
        connection = await DatabaseManager.getInstance().getGuildDb('connection-1')
    })
    afterAll(async () => {
        await connection.close()
    })
    beforeEach(async () => {
        await connection.collection('channels').deleteMany({})
    })

    describe('createChannel', () => {
        beforeEach(async () => {
            await connection.collection('channels').deleteMany({})
        })

        test('should create a channel', async () => {
            const result = await channelService.createChannel(connection, channel1)
            expect(result).toBeDefined()
            expect(result?.channelId).toEqual(channel1.channelId)

            const channelDoc1 = await channelService.getChannel(connection, {
                channelId: channel1.channelId,
            })

            expect(channelDoc1).toBeDefined()
            expect(channelDoc1).toMatchObject({
                channelId: channel1.channelId,
                name: channel1.name,
                parentId: channel1.parentId,
                type: channel1.type,
            })
        })
    })

    describe('createChannels', () => {
        beforeEach(async () => {
            await connection.collection('channels').deleteMany({})
        })
        test('should create channels', async () => {
            const result = await channelService.createChannels(connection, [channel1, channel2])
            expect(result).toMatchObject([channel1, channel2])

            const channelDoc1 = await channelService.getChannel(connection, {
                channelId: channel1.channelId,
            })

            const channelDoc2 = await channelService.getChannel(connection, {
                channelId: channel2.channelId,
            })

            expect(channelDoc1).toBeDefined()
            expect(channelDoc1).toMatchObject({
                channelId: channel1.channelId,
                name: channel1.name,
                parentId: channel1.parentId,
                type: channel1.type,
            })
            expect(channelDoc2).toBeDefined()
            expect(channelDoc2).toMatchObject({
                channelId: channel2.channelId,
                name: channel2.name,
                parentId: channel2.parentId,
                type: channel1.type,
            })
        })
    })

    describe('getChannel', () => {
        beforeEach(async () => {
            await connection.collection('channels').deleteMany({})
        })
        test('should retrieve an existing channel that match the filter criteria', async () => {
            await insertChannels([channel1], connection)
            const result = await channelService.getChannel(connection, {
                channelId: channel1.channelId,
            })
            expect(result).toMatchObject(channel1)
        })
        test('should return null when no channel match the filter criteria', async () => {
            await insertChannels([channel1], connection)
            const result = await channelService.getChannel(connection, {
                channelId: channel2.channelId,
            })
            expect(result).toBe(null)
        })
    })

    describe('getChannels', () => {
        beforeEach(async () => {
            await connection.collection('channels').deleteMany({})
        })
        test('should retrieve channels that match the filter criteria', async () => {
            await insertChannels([channel1, channel2, channel3], connection)
            const result = await channelService.getChannels(connection, {
                parentId: channel2.parentId,
            })
            expect(result).toMatchObject([channel2, channel3])
        })

        test('should return an empty array when no channels match the filter criteria', async () => {
            await insertChannels([channel1, channel2, channel3], connection)
            const result = await channelService.getChannels(connection, {
                parentId: '111111',
            })
            expect(result).toEqual([])
        })
    })

    describe('updateChannel', () => {
        beforeEach(async () => {
            await connection.collection('channels').deleteMany({})
        })
        const updateBody: IChannelUpdateBody = {
            name: 'Channel 10',
            parentId: '111111',
        }
        test('should update an existing channel that match the filter criteria', async () => {
            await insertChannels([channel1], connection)
            const result = await channelService.updateChannel(connection, { channelId: channel1.channelId }, updateBody)
            expect(result).toMatchObject(updateBody)

            const channelDoc1 = await channelService.getChannel(connection, {
                channelId: channel1.channelId,
            })

            expect(channelDoc1).toBeDefined()
            expect(channelDoc1).toMatchObject({
                name: updateBody.name,
                parentId: updateBody.parentId,
            })
        })

        test('should return null when no channel match the filter criteria', async () => {
            const result = await channelService.updateChannel(connection, { channelId: channel1.channelId }, updateBody)
            expect(result).toEqual(null)
        })
    })

    describe('updateChannels', () => {
        beforeEach(async () => {
            await connection.collection('channels').deleteMany({})
        })
        const updateBody: IChannelUpdateBody = {
            parentId: '111111',
        }
        test('should update channels that match the filter criteria', async () => {
            await insertChannels([channel1, channel2, channel3], connection)
            const result = await channelService.updateChannels(connection, { parentId: channel2.parentId }, updateBody)
            expect(result).toEqual(2)
            const channelDoc1 = await channelService.getChannel(connection, {
                channelId: channel2.channelId,
            })
            const channelDoc12 = await channelService.getChannel(connection, {
                channelId: channel3.channelId,
            })
            expect(channelDoc1?.parentId).toBe(updateBody.parentId)
            expect(channelDoc12?.parentId).toBe(updateBody.parentId)
        })

        test('should return 0 when no channels match the filter criteria', async () => {
            const result = await channelService.updateChannels(connection, { parentId: channel2.parentId }, updateBody)
            expect(result).toEqual(0)
        })
    })
})
