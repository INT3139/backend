import { db, pool } from '@/configs/db'
import { redis } from '@/configs/redis'
import { sql } from 'drizzle-orm'

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

        // Get all tables that exist in the database
        const existingTablesResult = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `)
        
        const existingTables = (existingTablesResult.rows as any[]).map(row => row.table_name)

        const tablesToClear = [
            'sys_notifications',
            'sys_attachments',
            'sys_audit_logs',
            'salary_logs',
            'salary_info',
            'workload_annual_summaries',
            'workload_evidences',
            'workload_individual_quotas',
            'reward_commendations',
            'reward_titles',
            'reward_disciplinary_records',
            'recruitment_candidates',
            'recruitment_proposals',
            'recruitment_contracts',
            'profile_work_histories',
            'profile_education_histories',
            'profile_extra_info',
            'profile_health_records',
            'profile_family_relations',
            'profile_staff',
            'organizational_units',
            'resource_scopes',
            'user_roles',
            'role_permissions',
            'permissions',
            'roles',
            'users'
        ]

        for (const table of tablesToClear) {
            if (existingTables.includes(table)) {
                try {
                    await db.execute(sql.raw(`TRUNCATE TABLE ${table} CASCADE`))
                } catch (error) {
                    console.error(`Failed to truncate ${table}`, error)
                }
            }
        }
    }

    /**
     * Get record by ID using raw query if table name is string
     */
    static async getById(table: string, id: number): Promise<any | null> {
        const result = await db.execute(sql.raw(`SELECT * FROM ${table} WHERE id = ${id}`))
        return result.rows[0] || null
    }

    /**
     * Delete record by ID
     */
    static async deleteById(table: string, id: number): Promise<void> {
        await db.execute(sql.raw(`DELETE FROM ${table} WHERE id = ${id}`))
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
        // Since ioredis is mocked in setup.ts, these might not do anything real
        try {
            await redis.del(`${prefix}*`)
        } catch (e) {}
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
        locals: {},
        ...overrides
    }

    return res
}
