import { query, queryOne } from "@/configs/db"
import { UUID, PaginationQuery, PaginatedResult } from "@/types"

export interface UserRow {
    id: UUID
    username: string
    email: string
    full_name: string
    unit_id: UUID | null
    is_active: boolean
    last_login_at: Date | null
    created_at: Date
}

export interface RoleRow {
    id: UUID
    code: string
    name: string
    description: string
    created_at: Date
}

export interface UnitRow {
    id: UUID
    code: string
    name: string
    unit_type: string
    parent_id: UUID | null
    created_at: Date
}

export interface AuditLogRow {
    id: number
    event_time: Date
    actor_id: UUID | null
    actor_ip: string | null
    action: string
    resource_type: string
    resource_id: string | null
    table_name: string | null
    old_values: any
    new_values: any
    diff: any
    session_id: string | null
    request_id: string | null
}

export class AdminRepo {
    /**
     * Get users with filter and pagination
     */
    async findUsers(
        pagination: PaginationQuery
    ): Promise<PaginatedResult<UserRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const countRes = await queryOne<{ total: string }>(
            `SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL`
        )
        const total = parseInt(countRes?.total || '0', 10)

        const rows = await query<UserRow>(
            `SELECT id, username, email, full_name, unit_id, is_active, last_login_at, created_at
             FROM users 
             WHERE deleted_at IS NULL
             ORDER BY ${sort || 'created_at'} ${order || 'desc'}
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        )

        return {
            data: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    /**
     * Get all roles
     */
    async findAllRoles(): Promise<RoleRow[]> {
        return await query<RoleRow>(`SELECT * FROM roles WHERE deleted_at IS NULL ORDER BY code`)
    }

    /**
     * Get all organizational units
     */
    async findAllUnits(): Promise<UnitRow[]> {
        return await query<UnitRow>(`SELECT * FROM organizational_units WHERE deleted_at IS NULL ORDER BY name`)
    }

    /**
     * Get audit logs
     */
    async findAuditLogs(
        pagination: PaginationQuery
    ): Promise<PaginatedResult<AuditLogRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const countRes = await queryOne<{ total: string }>(`SELECT COUNT(*) as total FROM sys_audit_logs`)
        const total = parseInt(countRes?.total || '0', 10)

        const rows = await query<AuditLogRow>(
            `SELECT * FROM sys_audit_logs 
             ORDER BY ${sort || 'event_time'} ${order || 'desc'}
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        )

        return {
            data: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    /**
     * Create new user
     */
    async createUser(data: Partial<UserRow> & { password_hash: string }): Promise<UserRow> {
        const res = await queryOne<UserRow>(
            `INSERT INTO users (
                username, email, password_hash, full_name, unit_id, is_active
            ) VALUES (
                $1, $2, $3, $4, $5, $6
            ) RETURNING *`,
            [data.username, data.email, data.password_hash, data.full_name, data.unit_id, data.is_active ?? true]
        )
        return res!
    }

    /**
     * Update user
     */
    async updateUser(id: UUID, data: Partial<UserRow>): Promise<UserRow | null> {
        const fields: string[] = []
        const params: any[] = []
        let paramIdx = 1

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIdx++}`)
                params.push(value)
            }
        }

        if (fields.length === 0) return null

        params.push(id)
        const res = await queryOne<UserRow>(
            `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
            params
        )
        return res
    }

    /**
     * Delete user
     */
    async deleteUser(id: UUID): Promise<boolean> {
        await query(`UPDATE users SET deleted_at = NOW() WHERE id = $1`, [id])
        return true
    }

    /**
     * Create Role
     */
    async createRole(data: Partial<RoleRow>): Promise<RoleRow> {
        const res = await queryOne<RoleRow>(
            `INSERT INTO roles (code, name, description) VALUES ($1, $2, $3) RETURNING *`,
            [data.code, data.name, data.description]
        )
        return res!
    }

    /**
     * Create Unit
     */
    async createUnit(data: Partial<UnitRow>): Promise<UnitRow> {
        const res = await queryOne<UnitRow>(
            `INSERT INTO organizational_units (code, name, unit_type, parent_id) VALUES ($1, $2, $3, $4) RETURNING *`,
            [data.code, data.name, data.unit_type, data.parent_id]
        )
        return res!
    }

    /**
     * Assign Role
     */
    async assignRole(userId: UUID, roleId: UUID, grantedBy: UUID, scopeType = 'school', scopeUnitId?: UUID, expiresAt?: Date) {
        await query(
            `INSERT INTO user_roles (user_id, role_id, scope_type, scope_unit_id, granted_by, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, roleId, scopeType, scopeUnitId, grantedBy, expiresAt]
        )
        return true
    }
}

export const adminRepo = new AdminRepo()