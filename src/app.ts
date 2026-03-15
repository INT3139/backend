import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './configs/swagger'

import { requestId } from './core/middlewares/requestId'
import { apiLimiter } from './core/middlewares/rateLimit'
import { errorHandler } from './core/middlewares/errorHandler'
import { httpLogStream } from './configs/logger'

import { authRoutes } from './modules/auth/auth.routes'
import { profileRoutes } from './modules/profile/profile.routes'
import { recruitmentRoutes } from './modules/recruitment/recruitment.routes'
import { salaryRoutes } from './modules/salary/salary.routes'
import { adminRoutes } from './modules/admin/admin.routes'
import { rewardRoutes } from './modules/reward/reward.routes'
import { workloadRoutes } from './modules/workload/workload.routes'

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

    // Swagger UI
    // if (env.NODE_ENV !== 'production') {
    //     app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    // }
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))


    // Register module routes
    app.use(`${API_PREFIX}/auth`, authRoutes)
    app.use(`${API_PREFIX}/admin`, adminRoutes)
    app.use(`${API_PREFIX}/profile`, profileRoutes)
    app.use(`${API_PREFIX}/recruitment`, recruitmentRoutes)
    app.use(`${API_PREFIX}/salary`, salaryRoutes)
    app.use(`${API_PREFIX}/reward`, rewardRoutes)
    app.use(`${API_PREFIX}/workload`, workloadRoutes)

    // Error handler MUST be last
    app.use(errorHandler);

    return app
}
