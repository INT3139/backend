import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from './env'
import * as schema from '../db/schema'

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
})

export const db = drizzle(pool, { schema })

export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const res = await pool.query(sql, params)
    return res.rows
}

export async function queryOne<T>(sql: string, params: any[] = []): Promise<T | null> {
    const res = await pool.query(sql, params)
    return res.rows[0] || null
}

pool.on('error', (err) => {
    console.error('Unexpected DB pool error on idle client', err)
    process.exit(1)
})

export async function closePool(): Promise<void> {
    await pool.end()
}
