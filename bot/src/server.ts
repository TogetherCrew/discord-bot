import express from 'express'
import bullMqUI from './queue/utils/ui.util'

const app = express()

app.use('/admin/queues', bullMqUI.getRouter())

export default app
