/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// InteractionResponseType
export enum InteractionResponseType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
  MODAL = 9,
  PREMIUM_REQUIRED = 10,
}

// InteractionType
export enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5,
}

// BitFields
interface BitFields {
  bitfield?: number;
  flags?: string;
}

// PermissionsBitField
interface PermissionsBitField {
  bitfield?: number;
  allPermissions?: number;
  defaultPermissions?: number;
  permissionFlags?: Record<string, boolean>;
  stageModerator?: number;
}

// User
interface User {
  id: string;
  createdAt?: string;
  client?: Record<string, any>;
  defaultAvatarUrl?: string;
  partial?: boolean;
  createdTimestamp?: number;
  discriminator?: string;
  bot?: boolean;
  avatar?: string;
  avatarDecoration?: string;
  banner?: string;
  accentColor?: number;
  displayName?: string;
  dmChannel?: Record<string, any>;
  flags?: number;
  globalName?: string;
  hexAccentColor?: string;
  system?: boolean;
  tag?: string;
  username?: string;
}

// Guild
interface Guild {
  id?: string;
  name?: string;
  icon?: string;
  features?: string[];
  available?: boolean;
  shardId?: number;
  splash?: string;
  banner?: string;
  description?: string;
  verificationLevel?: number;
  vanityURLCode?: string;
  nsfwLevel?: number;
  premiumSubscriptionCount?: number;
  discoverySplash?: string;
  memberCount?: number;
  large?: boolean;
  premiumProgressBarEnabled?: boolean;
  applicationId?: string;
  afkTimeout?: number;
  afkChannelId?: string;
  systemChannelId?: string;
  premiumTier?: number;
  widgetEnabled?: boolean;
  widgetChannelId?: string;
  explicitContentFilter?: number;
  mfaLevel?: number;
  joinedTimestamp?: number;
  defaultMessageNotifications?: number;
  maximumMembers?: number;
  maxVideoChannelUsers?: number;
  maxStageVideoChannelUsers?: number;
  approximateMemberCount?: number;
  approximatePresenceCount?: number;
  vanityURLUses?: number;
  rulesChannelId?: string;
  publicUpdatesChannelId?: string;
  preferredLocale?: string;
  safetyAlertsChannelId?: string;
  ownerId?: string;
}
// AllowedMentions
interface AllowedMentions {
  parse?: string[];
  roles?: number[];
  users?: string[];
  replied_user?: boolean;
}

// Embed
interface Attachment {
  id: string;
  filename?: string;
  description?: string;
  content_type?: string;
  size?: number;
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
  ephemeral?: boolean;
  duration_secs?: number;
  waveform?: string;
  flags?: number;
}

// Embed
interface Embed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: Record<string, any>;
  image?: Record<string, any>;
  thumbnail?: Record<string, any>;
  video?: Record<string, any>;
  provider?: Record<string, any>;
  author?: Record<string, any>;
  fields?: Array<Record<string, any>>;
}

// InteractionCallbackData
interface InteractionCallbackData {
  tts?: boolean | null;
  content?: string | null;
  embeds?: Embed[] | null;
  allowed_mentions?: string | null;
  flags?: number | null;
  components?: Array<Record<string, any>> | null;
  attachments?: Attachment[] | null;
}

// ChatInputCommandInteraction
export interface ChatInputCommandInteraction_broker {
  id: string;
  applicationId?: string | null;
  type?: number | null;
  channel?: Record<string, any> | null; // ?
  channelId?: string | null;
  token?: string | null;
  guildId?: string | null;
  user?: Record<string, any> | null;
  createdAt?: Date | null;
  deferred?: boolean | null;
  replied?: boolean | null;
  webhook?: Record<string, any> | null;
  member?: Record<string, any> | null;
  ephemeral?: boolean | null;
  guild?: Record<string, any> | null; // ?
  createdTimestamp?: number | null;
  appPermissions?: PermissionsBitField | null;
  locale?: string | null;
  guildLocale?: string | null;
  client?: Record<string, any> | null;
  command?: Record<string, any> | null;
  commandId?: string | null;
  commandName?: string | null;
  commandType?: any | null;
  commandGuildId?: string | null;
  memberPermissions?: PermissionsBitField | null;
  options?: Record<string, any> | null;
  version?: number | null;
}

// FollowUpMessageData
export interface FollowUpMessageData {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: Embed[];
  allowed_mentions?: AllowedMentions;
  components?: any[];
  files?: any[]; //
  payload_json?: string;
  attachments?: Attachment[];
  flags?: number;
  thread_name?: string;
}

// InteractionResponseEditData
export interface InteractionResponseEditData {
  thread_id?: number | null;
  content?: string | null;
  embeds?: Embed[] | null;
  allowed_mentions?: AllowedMentions | null;
  components?: Array<Array<Record<string, any>>> | null;
  files?: Array<Record<string, any>> | null;
  payload_json?: string | null;
  attachments?: Attachment[] | null;
}

// InteractionResponse
export interface InteractionResponse {
  type: number;
  data?: InteractionCallbackData | null;
}
