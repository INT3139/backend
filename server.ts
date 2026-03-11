import { createApp } from "@/app";
import { pool } from "@/configs/db";
import { redis } from "@/configs/redis";
import { logger } from "@/configs/logger";
import { env } from "@/configs/env";

async function bootstrap(): Promise<void> {
    await pool.query('SELECT 1')
    logger.info('PostgreSQL connected')

    await redis.ping()
    logger.info('Redis connected')

    const app = createApp()
    app.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT}`)
    })
}

bootstrap().catch(err => {
    logger.error('Failed to start server', { error: err })
    process.exit(1)
})

const gracefulShutdown = () => {
    logger.info('Shutting down gracefully...')
    pool.end()
    redis.quit()
    process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)