import mongoose, { Connection } from 'mongoose';
import {
    IChannel,
    channelSchema,
    IChannelUpdateBody,
} from '@togethercrew.dev/db';
import setupTestDB from '../../../utils/setupTestDB';
import {
    channel1,
    channel2,
    channel3,
    insertChannels
} from '../../../fixtures/channel.fixture';
import { channelService } from '../../../../src/database/services';
import config from '../../../../src/config';
setupTestDB();

describe('channel service', () => {
    let connection: Connection;

    beforeAll(async () => {
        connection = await mongoose.createConnection(config.mongoose.serverURL, {
            dbName: 'connection',
        });
        connection.model<IChannel>('Channel', channelSchema);
    });

    afterAll(async () => {
        await connection.close();
    });

    beforeEach(async () => {
        await connection.db.dropDatabase();
    });

    describe('createChannel', () => {
        test('should create a channel', async () => {
            const result = await channelService.createChannel(
                connection,
                channel1
            );
            expect(result).toBeDefined();
            expect(result?.id).toEqual(channel1.id);

            const channelDoc1 = await channelService.getChannel(
                connection,
                { id: channel1.id }
            );

            expect(channelDoc1).toBeDefined();
            expect(channelDoc1).toMatchObject({
                id: channel1.id,
                name: channel1.name,
                parent_id: channel1.parent_id,
            });
        });
    });

    describe('createChannels', () => {
        test('should create channels', async () => {
            const result = await channelService.createChannels(connection, [
                channel1,
                channel2,
            ]);
            expect(result).toMatchObject([channel1, channel2]);

            const channelDoc1 = await channelService.getChannel(
                connection,
                { id: channel1.id }
            );

            const channelDoc2 = await channelService.getChannel(
                connection,
                { id: channel2.id }
            );

            expect(channelDoc1).toBeDefined();
            expect(channelDoc1).toMatchObject({
                id: channel1.id,
                name: channel1.name,
                parent_id: channel1.parent_id,
            });
            expect(channelDoc2).toBeDefined();
            expect(channelDoc2).toMatchObject({
                id: channel2.id,
                name: channel2.name,
                parent_id: channel2.parent_id,
            });
        });
    });

    describe('getChannel', () => {
        test('should retrieve an existing channel that match the filter criteria', async () => {
            await insertChannels([channel1], connection);
            const result = await channelService.getChannel(connection, {
                id: channel1.id,
            });
            expect(result).toMatchObject(channel1);
        });
        test('should return null when no channel match the filter criteria', async () => {
            await insertChannels([channel1], connection);
            const result = await channelService.getChannel(connection, {
                id: channel2.id,
            });
            expect(result).toBe(null);
        });
    });

    describe('getChannels', () => {
        test('should retrieve channels that match the filter criteria', async () => {
            await insertChannels([channel1, channel2, channel3], connection);
            const result = await channelService.getChannels(connection, {
                parent_id: channel2.parent_id,
            });
            expect(result).toMatchObject([channel2, channel3]);
        });

        test('should return an empty array when no channels match the filter criteria', async () => {
            await insertChannels([channel1, channel2, channel3], connection);
            const result = await channelService.getChannels(connection, {
                parent_id: "111111",
            });
            expect(result).toEqual([]);
        });
    });

    describe('updateChannel', () => {
        const updateBody: IChannelUpdateBody = {
            name: 'Channel 10',
            parent_id: "111111"
        };
        test('should update an existing channel that match the filter criteria', async () => {
            await insertChannels([channel1], connection);
            const result = await channelService.updateChannel(
                connection,
                { id: channel1.id },
                updateBody
            );
            expect(result).toMatchObject(updateBody);

            const channelDoc1 = await channelService.getChannel(
                connection,
                { id: channel1.id }
            );

            expect(channelDoc1).toBeDefined();
            expect(channelDoc1).toMatchObject({
                name: updateBody.name,
                parent_id: updateBody.parent_id,
            });
        });

        test('should return null when no channel match the filter criteria', async () => {
            const result = await channelService.updateChannel(
                connection,
                { id: channel1.id },
                updateBody
            );
            expect(result).toEqual(null);
        });
    });

    describe('updateChannels', () => {
        const updateBody: IChannelUpdateBody = {
            parent_id: "111111"
        };
        test('should update channels that match the filter criteria', async () => {
            await insertChannels([channel1, channel2, channel3], connection);
            const result = await channelService.updateChannels(
                connection,
                { parent_id: channel2.parent_id },
                updateBody
            );
            expect(result).toEqual(2);
            const channelDoc1 = await channelService.getChannel(
                connection,
                { id: channel2.id }
            );
            const channelDoc12 = await channelService.getChannel(
                connection,
                { id: channel3.id }
            );
            expect(channelDoc1?.parent_id).toBe(updateBody.parent_id);
            expect(channelDoc12?.parent_id).toBe(updateBody.parent_id);
        });

        test('should return 0 when no channels match the filter criteria', async () => {
            const result = await channelService.updateChannels(
                connection,
                { parent_id: channel2.parent_id },
                updateBody
            );
            expect(result).toEqual(0);
        });
    });

});
