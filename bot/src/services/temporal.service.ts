import { Client, Connection } from '@temporalio/client'
import config from '../config'


export async function createTemporalClient(): Promise<Client> {
  const connection = await Connection.connect({ address: config.temporal.uri })
  return new Client({
    connection,
  })
}
