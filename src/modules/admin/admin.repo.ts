import { db } from "@/configs/db"
import { ID, PaginationQuery, PaginatedResult } from "@/types"
import { users, roles, organizationalUnits, sysAuditLogs, userRoles } from "@/db/schema"
import { eq, and, sql, count, desc, asc, isNull } from "drizzle-orm"

export type UserRow = typeof users.$inferSelect
export type SafeUserRow = Omit<UserRow, 'passwordHash' | 'deletedAt'>
export type RoleRow = typeof roles.$inferSelect
export type UnitRow = typeof organizationalUnits.$inferSelect
export type AuditLogRow = typeof sysAuditLogs.$inferSelect

export class AdminRepo {
    /**
     * Get users with filter and pagination
     */
    async findUsers(
        pagination: PaginationQuery
    ): Promise<PaginatedResult<SafeUserRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const countRes = await db.select({ total: count() })
            .from(users)
            .where(sql`${users.deletedAt} IS NULL`)
        const total = Number(countRes[0].total)

        const ALLOWED_SORT_COLUMNS: Record<string, any> = {
            createdAt: users.createdAt,
            fullName: users.fullName,
            username: users.username,
            email: users.email,
        }

        let orderBy = desc(users.createdAt)
        if (sort && ALLOWED_SORT_COLUMNS[sort]) {
            orderBy = order === 'asc' ? asc(ALLOWED_SORT_COLUMNS[sort]) : desc(ALLOWED_SORT_COLUMNS[sort])
        }

        const rows = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            fullName: users.fullName,
            unitId: users.unitId,
            isActive: users.isActive,
            createdAt: users.createdAt,
            lastLoginAt: users.lastLoginAt,
        })
            .from(users)
            .where(sql`${users.deletedAt} IS NULL`)
            .limit(limit)
            .offset(offset)
            .orderBy(orderBy)

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
        return await db.select()
            .from(roles)
            .where(sql`${roles.deletedAt} IS NULL`)
            .orderBy(roles.code)
    }

    /**
     * Get all organizational units
     */
    async findAllUnits(): Promise<UnitRow[]> {
        return await db.select()
            .from(organizationalUnits)
            .where(sql`${organizationalUnits.deletedAt} IS NULL`)
            .orderBy(organizationalUnits.name)
    }

    /**
     * Get audit logs
     */
    async findAuditLogs(
        pagination: PaginationQuery
    ): Promise<PaginatedResult<AuditLogRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const countRes = await db.select({ total: count() }).from(sysAuditLogs)
        const total = Number(countRes[0].total)

        let orderBy: any = desc(sysAuditLogs.eventTime)
        if (sort) {
            const column = (sysAuditLogs as any)[sort]
            if (column) {
                orderBy = order === 'asc' ? asc(column) : desc(column)
            }
        }

        const rows = await db.select()
            .from(sysAuditLogs)
            .limit(limit)
            .offset(offset)
            .orderBy(orderBy)

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
    async createUser(data: any): Promise<UserRow> {
        const res = await db.insert(users)
            .values(data)
            .returning()
        return res[0]
    }

    /**
     * Update user
     */
    async updateUser(id: ID, data: any): Promise<UserRow | null> {
        const res = await db.update(users)
            .set(data)
            .where(eq(users.id, id))
            .returning()
        return res[0] ?? null
    }

    /**
     * Delete user
     */
    async deleteUser(id: ID): Promise<boolean> {
        await db.update(users)
            .set({ deletedAt: new Date() })
            .where(eq(users.id, id))
        return true
    }

    /**
     * Get user roles
     */
    async getRolesForUser(userId: ID): Promise<string[]> {
        const rows = await db.select({ code: roles.code })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(and(eq(userRoles.userId, userId), isNull(userRoles.expiresAt)))
        return rows.map(r => r.code)
    }

    /**
     * Create Role
     */
    async createRole(data: any): Promise<RoleRow> {
        const res = await db.insert(roles)
            .values(data)
            .returning()
        return res[0]
    }

    /**
     * Create Unit
     */
    async createUnit(data: any): Promise<UnitRow> {
        const res = await db.insert(organizationalUnits)
            .values(data)
            .returning()
        return res[0]
    }

    /**
     * Assign Role
     */
    async assignRole(userId: ID, roleId: ID, grantedBy: ID, scopeType: any = 'school', scopeUnitId?: ID, expiresAt?: Date) {
        await db.insert(userRoles)
            .values({
                userId,
                roleId,
                scopeType,
                scopeUnitId,
                grantedBy,
                expiresAt
            })
        return true
    }

    /**
     * Revoke Role
     */
    async revokeRole(userId: ID, roleId: ID) {
        await db.delete(userRoles)
            .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
        return true
    }
}

export const adminRepo = new AdminRepo()

