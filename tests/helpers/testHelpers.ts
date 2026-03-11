import { pool } from '@/configs/db'
import { redis } from '@/configs/redis'

/**
 * Test database helpers
 */
export class TestDbHelper {
    /**
     * Clear all data from tables (in test database only!)
     */
    static async clearAllTables(): Promise<void> {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Cannot clear tables outside of test environment!')
        }

        const tables = [
            'sys_notifications',
            'sys_attachments',
            'sys_audit_logs',
            'salary_logs',
            'salary_info',
            'workload_annual_summaries',
            'workloads',
            'reward_titles',
            'recruitments',
            'profile_staff',
            'organizational_units',
            'user_roles',
            'role_permissions',
            'permissions',
            'roles',
            'users'
        ]

        for (const table of tables) {
            try {
                await pool.query(`TRUNCATE TABLE ${table} CASCADE`)
            } catch (error) {
                // Table might not exist, continue
            }
        }
    }

    /**
     * Insert test data
     */
    static async insertData(table: string, data: Record<string, any>): Promise<any> {
        const keys = Object.keys(data)
        const values = Object.values(data)
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

        const result = await pool.query(
            `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
            values
        )

        return result.rows[0]
    }

    /**
     * Get record by ID
     */
    static async getById(table: string, id: string): Promise<any | null> {
        const result = await pool.query(
            `SELECT * FROM ${table} WHERE id = $1`,
            [id]
        )
        return result.rows[0] || null
    }

    /**
     * Delete record by ID
     */
    static async deleteById(table: string, id: string): Promise<void> {
        await pool.query(
            `DELETE FROM ${table} WHERE id = $1`,
            [id]
        )
    }
}

/**
 * Test Redis helpers
 */
export class TestRedisHelper {
    /**
     * Clear all Redis keys with prefix
     */
    static async clearKeys(prefix: string): Promise<void> {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Cannot clear Redis keys outside of test environment!')
        }

        const keys: string[] = []
        let cursor = 0

        do {
            const result = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100)
            cursor = Number(result[0])
            if (result[1]) {
                keys.push(...result[1])
            }
        } while (cursor !== 0)

        if (keys.length > 0) {
            await redis.del(...keys)
        }
    }

    /**
     * Clear all test keys
     */
    static async clearAll(): Promise<void> {
        await this.clearKeys('test:')
        await this.clearKeys('perm:')
        await this.clearKeys('cache:')
    }
}

/**
 * Create test request context
 */
export function createMockRequestContext(overrides?: Partial<any>) {
    return {
        requestId: 'test-request-id',
        user: null,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        ...overrides
    }
}

/**
 * Create mock Express request object
 */
export function createMockRequest(overrides?: Partial<any>) {
    return {
        headers: {},
        body: {},
        query: {},
        params: {},
        cookies: {},
        user: null,
        ip: '127.0.0.1',
        ...overrides
    }
}

/**
 * Create mock Express response object
 */
export function createMockResponse(overrides?: Partial<any>) {
    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis(),
        ...overrides
    }

    return res
}
