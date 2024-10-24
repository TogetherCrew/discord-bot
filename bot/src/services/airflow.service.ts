import fetch from 'node-fetch'
import parentLogger from '../config/logger'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import config from '../config'
import { type ObjectId } from 'mongodb'
import { type Snowflake } from 'discord.js'

const logger = parentLogger.child({ module: 'airflowService' })

interface DagConfig {
    platform_id: ObjectId
    guild_id: Snowflake
    period: Date
    recompute: boolean
}

/**
 * Triggers the DAG run in Apache Airflow.
 * @param {DagConfig} params - The parameters object.
 * @returns {Promise<any>} - The response from the Airflow DAG run trigger.
 */
async function triggerDag(params: DagConfig): Promise<any> {
    const dagRunId = uuidv4()
    const logicalDate = moment().add(1, 'minute').toISOString()
    const body = {
        dag_run_id: dagRunId,
        logical_date: logicalDate,
        conf: {
            ...params,
        },
        note: null,
    }
    logger.info({ body }, 'Triggering DAG run')

    try {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const auth = Buffer.from(`${config.airflow.username}:${config.airflow.password}`).toString('base64')
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const response = await fetch(`${config.airflow.baseURL}/api/v1/dags/discord_guild_analyzer_etl/dagRuns`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${auth}`,
            },
        })

        if (!response.ok) {
            const error = await response.json()
            logger.error({ error, body }, 'Failed to trigger DAG run')
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw new Error(`Airflow API call failed with status ${response.status}: ${error.message}`)
        } else {
            const data = await response.json()
            logger.info({ data }, 'Successfully triggered DAG run')
            return data
        }
    } catch (error) {
        logger.error(
            {
                error,
                body,
            },
            'Failed to trigger DAG run'
        )
        throw error // Re-throw the error to handle it further up the call stack if needed.
    }
}

export default {
    triggerDag,
}
