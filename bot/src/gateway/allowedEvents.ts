import { GatewayDispatchEvents } from 'discord-api-types/v10'

export const ALLOWED_EVENTS = new Set<GatewayDispatchEvents>([
    GatewayDispatchEvents.ChannelCreate,
    GatewayDispatchEvents.ChannelDelete,
    GatewayDispatchEvents.ChannelUpdate,
    GatewayDispatchEvents.ThreadCreate,
    GatewayDispatchEvents.ThreadUpdate,
    GatewayDispatchEvents.ThreadDelete,
    GatewayDispatchEvents.MessageCreate,
    GatewayDispatchEvents.MessageUpdate,
    GatewayDispatchEvents.MessageDelete,
    GatewayDispatchEvents.MessageDeleteBulk,
    GatewayDispatchEvents.MessageReactionAdd,
    GatewayDispatchEvents.MessageReactionRemove,
    GatewayDispatchEvents.MessageReactionRemoveAll,
    GatewayDispatchEvents.MessageReactionRemoveEmoji,
    GatewayDispatchEvents.GuildRoleCreate,
    GatewayDispatchEvents.GuildRoleUpdate,
    GatewayDispatchEvents.GuildRoleDelete,
    GatewayDispatchEvents.GuildMemberAdd,
    GatewayDispatchEvents.GuildMemberRemove,
    GatewayDispatchEvents.GuildMemberUpdate,
    GatewayDispatchEvents.UserUpdate,
] as const)

export function isAllowedEvent(t: unknown): t is typeof ALLOWED_EVENTS extends ReadonlySet<infer U> ? U : never {
    return typeof t === 'string' && ALLOWED_EVENTS.has(t as GatewayDispatchEvents)
}
