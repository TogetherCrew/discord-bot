import { ChoreographyDict, MBConnection, Status } from "@togethercrew.dev/tc-messagebroker"

export async function createAndStartCronJobSaga(data: Record<string, any>){
    const saga = await MBConnection.models.Saga.create({
        status: Status.NOT_STARTED,
        data: data,
        choreography: ChoreographyDict.DISCORD_SCHEDULED_JOB
    })
    
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await saga.start(() => { })

    return saga   
}
