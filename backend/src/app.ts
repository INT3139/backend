import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'

import { requestId } from './core/middlewares/requestId'
import { apiLimiter } from './core/middlewares/rateLimit'
import { errorHandler } from './core/middlewares/errorHandler'
import { httpLogStream } from './configs/logger'

const API_PREFIX = '/api/v1'

export function createApp(): Application {
    const app = express()
    
    app.use(helmet())
    app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }))
    app.use(compression())
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true }))
    app.use(requestId)
    app.use(morgan('combined', { stream: httpLogStream }))
    app.use('/api', apiLimiter)

    app.get('/health', (_, res) => res.json(
        { status: 'ok', ts: new Date().toISOString() }
    ))

    app.use(errorHandler)
    return app
}

