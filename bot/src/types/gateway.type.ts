import {
    GatewayDispatchEvents,
    GatewayChannelCreateDispatchData,
    GatewayChannelUpdateDispatchData,
    GatewayThreadCreateDispatchData,
    GatewayThreadUpdateDispatchData,
    GatewayMessageCreateDispatchData,
    GatewayMessageUpdateDispatchData,
    GatewayGuildRoleUpdateDispatchData,
    GatewayGuildMemberUpdateDispatchData,
    GatewayUserUpdateDispatchData,
} from 'discord-api-types/v10'

export type EventPayloadMap = {
    [GatewayDispatchEvents.ChannelCreate]: GatewayChannelCreateDispatchData
    [GatewayDispatchEvents.ChannelDelete]: GatewayChannelCreateDispatchData
    [GatewayDispatchEvents.ChannelUpdate]: GatewayChannelUpdateDispatchData
    [GatewayDispatchEvents.ThreadCreate]: GatewayThreadCreateDispatchData
    [GatewayDispatchEvents.ThreadUpdate]: GatewayThreadUpdateDispatchData
    [GatewayDispatchEvents.ThreadDelete]: GatewayChannelCreateDispatchData
    [GatewayDispatchEvents.MessageCreate]: GatewayMessageCreateDispatchData
    [GatewayDispatchEvents.MessageUpdate]: GatewayMessageUpdateDispatchData
    [GatewayDispatchEvents.MessageDelete]: GatewayChannelCreateDispatchData
    [GatewayDispatchEvents.MessageDeleteBulk]: GatewayChannelCreateDispatchData
    [GatewayDispatchEvents.MessageReactionAdd]: GatewayChannelCreateDispatchData
    [GatewayDispatchEvents.MessageReactionRemove]: GatewayChannelCreateDispatchData
    [GatewayDispatchEvents.MessageReactionRemoveAll]: GatewayChannelCreateDispatchData
    [GatewayDispatchEvents.MessageReactionRemoveEmoji]: GatewayChannelCreateDispatchData
    [GatewayDispatchEvents.GuildRoleCreate]: GatewayGuildRoleUpdateDispatchData
    [GatewayDispatchEvents.GuildRoleUpdate]: GatewayGuildRoleUpdateDispatchData
    [GatewayDispatchEvents.GuildRoleDelete]: GatewayGuildRoleUpdateDispatchData
    [GatewayDispatchEvents.GuildMemberAdd]: GatewayGuildMemberUpdateDispatchData
    [GatewayDispatchEvents.GuildMemberRemove]: GatewayGuildMemberUpdateDispatchData
    [GatewayDispatchEvents.GuildMemberUpdate]: GatewayGuildMemberUpdateDispatchData
    [GatewayDispatchEvents.UserUpdate]: GatewayUserUpdateDispatchData
}

export interface DiscordEventEnvelope<K extends keyof EventPayloadMap = keyof EventPayloadMap> {
    type: K
    data: EventPayloadMap[K]
    shardId: number
    ts: number
}
