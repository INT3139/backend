import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'
import { env } from './env'

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
})

pool.on('error', (err) => {
    console.error('Unexpected DB pool error on idle client', err)
    process.exit(1)
})

export async function query<T extends QueryResultRow = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
): Promise<T[]> {
    const result: QueryResult<T> = await pool.query(sql, params);
    return result.rows
}

export async function queryOne<T extends QueryResultRow = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
): Promise<T | null> {
    const rows = await query<T>(sql, params)
    return rows[0] ?? null
}

export async function getClient(): Promise<PoolClient> {
    return await pool.connect()
}

export async function closePool(): Promise<void> {
    await pool.end()
}

export async function withTransaction<T>(
    fn: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function withTransactionRetry<T>(
    fn: (client: PoolClient) => Promise<T>,
    retries = 3,
    delay = 100
): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await withTransaction(fn);
        } catch (err) {
            if (attempt < retries - 1) {
                console.warn(`Transaction failed, retrying... (${attempt + 1}/${retries})`, err);
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw err;
            }
        }
    }
    throw new Error('Transaction failed after all retries');
}

export async function setAuditContext(client: PoolClient, userId: string): Promise<void> {
    await client.query(
        `SET LOCAL app.current_user_id = $1`,
        [userId]
    )
}