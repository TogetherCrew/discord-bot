import { WorkerFactory } from './index';
import { Worker, type Job } from 'bullmq';
import { redisConfig, discordEventConfig } from '../../config/queue';
import { Events } from 'discord.js';
import {
  channelCreateHandler,
  channelUpdateHandler,
  channelDeleteHandler,
  guildMemberAddHandler,
  guildMemberUpdateHandler,
  guildMemberRemoveHandler,
  roleCreateHandler,
  roleUpdateHandler,
  roleDeleteHandler,
  userUpdateHandler,
} from '../handlers';

export const discordEventWorker = new Worker(
  'discordEventQueue',
  async (job: Job<any, any, string> | undefined) => {
    if (job !== null && job !== undefined) {
      switch (job.data.type) {
        case Events.ChannelCreate: {
          await channelCreateHandler(job.data.guildId, job.data.dataToStore);
          break;
        }
        case Events.ChannelUpdate: {
          await channelUpdateHandler(job.data.guildId, job.data.dataToStore);
          break;
        }
        case Events.ChannelDelete: {
          await channelDeleteHandler(job.data.guildId, job.data.channelId);
          break;
        }
        case Events.GuildMemberAdd: {
          await guildMemberAddHandler(job.data.guildId, job.data.dataToStore);
          break;
        }
        case Events.GuildMemberUpdate: {
          await guildMemberUpdateHandler(job.data.guildId, job.data.dataToStore);
          break;
        }
        case Events.GuildMemberRemove: {
          await guildMemberRemoveHandler(job.data.guildId, job.data.guildMemberId);
          break;
        }
        case Events.GuildRoleCreate: {
          console.log('wtf', job.data.guildId, job.data.dataToStore);
          await roleCreateHandler(job.data.guildId, job.data.dataToStore);
          break;
        }
        case Events.GuildRoleUpdate: {
          await roleUpdateHandler(job.data.guildId, job.data.dataToStore);
          break;
        }
        case Events.GuildRoleDelete: {
          await roleDeleteHandler(job.data.guildId, job.data.roleId);
          break;
        }
        case Events.UserUpdate: {
          await userUpdateHandler(job.data.dataToStore);
          break;
        }
      }
    }
  },
  {
    connection: redisConfig,
    limiter: discordEventConfig,
  },
);

WorkerFactory.attachEventListeners(discordEventWorker);
