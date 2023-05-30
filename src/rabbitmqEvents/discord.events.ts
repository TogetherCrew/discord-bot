import RabbitMQ, { Event, MBConnection } from "@togethercrew.dev/tc-messagebroker";


RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH, async (msg) => {
    if(!msg) return ;

    const { content } = msg
    const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid })
    console.log("[SAGA] ", saga)
    console.log("[guildID] ", saga.data.get("guildId"))
    console.log("[guildID] ", saga.data.get("created"))

    // [SAGA]  {
    //     _id: new ObjectId("64759dec84bad348c3f6e203"),
    //     choreography: {
    //       name: 'DISCORD_UPDATE_CHANNELS',
    //       transactions: [ [Object], [Object] ]
    //     },
    //     status: 'IN_PROGRESS',
    //     data: Map(2) { 'guildId' => '1067869571547140146', 'created' => 'false' },
    //     sagaId: 'fd498430-feb6-11ed-b0d5-771936b7d5d1',
    //     createdAt: 2023-05-30T06:55:40.534Z,
    //     updatedAt: 2023-05-30T06:55:40.569Z,
    //     __v: 1
    //   }

    // TODO: do the staff

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await saga.next(() => {})

})