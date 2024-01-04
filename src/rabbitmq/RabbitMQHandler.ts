import RabbitMQ, { Event } from '@togethercrew.dev/tc-messagebroker';
import { handleFetchEvent } from './events/fetchEvent';
import { handleSendMessageEvent } from './events/sendMessageEvent';
import { handleFetchMembersEvent } from './events/fetchMembersEvent';
import { handleInteractionResponseCreate } from './events/interactionResponseCreate';
import { handleInteractionResponseEdit } from './events/interactionResponseEdit';
import { handleInteractionResponseDelete } from './events/interactionResponseDelete';
import { handleFollowUpMessageCreate } from './events/FollowUpMessageCreate';

export function setupRabbitMQHandlers() {
    RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH, handleFetchEvent);
    RabbitMQ.onEvent(Event.DISCORD_BOT.SEND_MESSAGE, handleSendMessageEvent);
    RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH_MEMBERS, handleFetchMembersEvent);
    RabbitMQ.onEvent(Event.DISCORD_BOT.INTERACTION_RESPONSE.CREATE, handleInteractionResponseCreate);
    RabbitMQ.onEvent(Event.DISCORD_BOT.INTERACTION_RESPONSE.EDIT, handleInteractionResponseEdit);
    RabbitMQ.onEvent(Event.DISCORD_BOT.INTERACTION_RESPONSE.DELETE, handleInteractionResponseDelete);
    RabbitMQ.onEvent(Event.DISCORD_BOT.FOLLOWUP_MESSAGE.CREATE, handleFollowUpMessageCreate);
}