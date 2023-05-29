import RabbitMQ, { Event, MBConnection } from "@togethercrew.dev/tc-messagebroker";


RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH, async (msg) => {
    if(!msg) return ;

    const { content } = msg
    const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid })
    console.log("[SAGA] ", saga)
    console.log("[guildID] ", saga.data.get("guildId"))

    // TODO: do the staff

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    saga.next(() => {})

})