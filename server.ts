import { createApp } from "@/app";
import { db, pool } from "@/configs/db";
import { sql } from "drizzle-orm";
import { redis } from "@/configs/redis";
import { logger } from "@/configs/logger";
import { env } from "@/configs/env";
import { startJobs } from "@/jobs/scheduler";

/**
 * Global Patch for BigInt serialization.
 * Necessary because sys_audit_logs uses BigInt for IDs,
 * which JSON.stringify does not support by default.
 */
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

async function bootstrap(): Promise<void> {
    await db.execute(sql`SELECT 1`)
    logger.info('PostgreSQL connected')

    await redis.ping()
    logger.info('Redis connected')

    // Khởi động background jobs
    startJobs()
    logger.info('Background jobs started')


    const app = createApp()
    app.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT}`)
    })
}

bootstrap().catch(err => {
    logger.error('Failed to start server', { error: err })
    process.exit(1)
})

const gracefulShutdown = async () => {
    logger.info('Shutting down gracefully...')
    await pool.end()
    await redis.quit()
    process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)