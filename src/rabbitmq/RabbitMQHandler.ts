import RabbitMQ, { Event } from '@togethercrew.dev/tc-messagebroker';
import { handleFetchEvent } from './events/fetchEvent';
import { handleSendMessageEvent } from './events/sendMessageEvent';
import { handleFetchMembersEvent } from './events/fetchMembersEvent';

export function setupRabbitMQHandlers() {
    RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH, handleFetchEvent);
    RabbitMQ.onEvent(Event.DISCORD_BOT.SEND_MESSAGE, handleSendMessageEvent);
    RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH_MEMBERS, handleFetchMembersEvent);
}