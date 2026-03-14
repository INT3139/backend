import { db } from "@/configs/db"
import { userRoles, rolePermissions, permissions } from "@/db/schema/auth"
import { eq, and, isNull } from "drizzle-orm"
import { rSadd, rIsMember, rSmembers, rGetJson, rSetJson, rDel, rExists } from "@/configs/redis"
import { expandAll } from "./wildcardExpand"
import { CacheKey, CacheTTL} from "../cache/cacheKey"
import { ID, UserScope } from "@/types"

export class PermissionService {
    /**
     * Load tất cả permissions + scopes của user vào cache
     * Called sau khi login
     */
    async loadForUser(userId: ID): Promise<void> {
        const rows = await db.select({
            code: permissions.code,
            scopeType: userRoles.scopeType,
            scopeUnitId: userRoles.scopeUnitId
        })
        .from(userRoles)
        .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
        .innerJoin(permissions, eq(permissions.code, rolePermissions.permissionCode))
        .where(and(
            eq(userRoles.userId, userId),
            isNull(userRoles.expiresAt),
            eq(permissions.isActive, true)
        ))

        const permCodes = rows.map(r => r.code)
        const scopes: UserScope[] = rows.map(r => ({
            scopeType: r.scopeType as UserScope['scopeType'],
            unitId: r.scopeUnitId as ID | null
        }))

        // Cache perm codes
        const codesKey = CacheKey.permCodes(userId)
        await rDel(codesKey)
        if (permCodes.length > 0) {
            await rSadd(codesKey, permCodes, CacheTTL.PERM_CODES)
        }

        // Cache scopes (JSON)
        const scopesKey = CacheKey.permScopes(userId)
        await rSetJson(scopesKey, scopes, CacheTTL.PERM_SCOPES)
    }

    /**
     * Check xem user có permission cụ thể không
     */
    async hasPermission(userId: ID, permissionCode: string): Promise<boolean> {
        const key = CacheKey.permCodes(userId)
        if (!await rExists(key)) {
            await this.loadForUser(userId)
        }
        return await rIsMember(key, permissionCode)
    }

    /**
     * Check user có bất kỳ permission nào trong danh sách không
     */
    async hasAnyPermission(userId: ID, permissionCodes: string[]): Promise<boolean> {
        for (const code of permissionCodes) {
            if (await this.hasPermission(userId, code)) {
                return true
            }
        }
        return false
    }

    /**
     * Check user có tất cả permissions trong danh sách không
     */
    async hasAllPermissions(userId: ID, permissionCodes: string[]): Promise<boolean> {
        for (const code of permissionCodes) {
            if (!await this.hasPermission(userId, code)) {
                return false
            }
        }
        return true
    }

    /**
     * Get scopes của user từ cache
     */
    async getScopes(userId: ID): Promise<UserScope[]> {
        const key = CacheKey.permScopes(userId)
        const cached = await rGetJson<UserScope[]>(key)
        if (cached) {
            return cached
        }
        await this.loadForUser(userId)
        return await rGetJson<UserScope[]>(key) || []
    }

    /**
     * Alias for getScopes
     */
    async getScopesForUser(userId: ID): Promise<UserScope[]> {
        return await this.getScopes(userId)
    }

    /**
     * Invalidate cache permissions của user
     * Called khi có thay đổi role/permission
     */
    async invalidate(userId: ID): Promise<void> {
        await rDel(CacheKey.permCodes(userId))
        await rDel(CacheKey.permScopes(userId))
    }

    /**
     * Đảm bảo role có permission cụ thể (dùng cho admin)
     */
    async ensureRoleHasPerm(roleId: ID, permissionCode: string): Promise<void> {
        await db.insert(rolePermissions)
            .values({
                roleId: roleId,
                permissionCode: permissionCode
            })
            .onConflictDoNothing()
    }

    /**
     * Grant permission cho role
     */
    async grantPermissionToRole(roleId: ID, permissionCode: string): Promise<void> {
        await this.ensureRoleHasPerm(roleId, permissionCode)
        // Invalidate cache của tất cả user có role này
        await this.invalidateUsersWithRole(roleId)
    }

    /**
     * Revoke permission khỏi role
     */
    async revokePermissionFromRole(roleId: ID, permissionCode: string): Promise<void> {
        await db.delete(rolePermissions)
            .where(and(
                eq(rolePermissions.roleId, roleId),
                eq(rolePermissions.permissionCode, permissionCode)
            ))
        await this.invalidateUsersWithRole(roleId)
    }

    /**
     * Invalidate cache của tất cả user có role cụ thể
     */
    async invalidateUsersWithRole(roleId: ID): Promise<void> {
        const rows = await db.select({ userId: userRoles.userId })
            .from(userRoles)
            .where(and(
                eq(userRoles.roleId, roleId),
                isNull(userRoles.expiresAt)
            ))
            
        const userIds = Array.from(new Set(rows.map(r => r.userId)))
        for (const uid of userIds) {
            await this.invalidate(uid)
        }
    }

    /**
     * Alias for invalidateUsersWithRole to match invalidation service usage
     */
    async invalidateByRole(roleId: ID): Promise<void> {
        return await this.invalidateUsersWithRole(roleId)
    }

    /**
     * Expand wildcard pattern thành danh sách permissions thực tế
     */
    async expandPermissions(patterns: string[]): Promise<string[]> {
        return await expandAll(patterns)
    }

    /**
     * Get permissions raw của user (cho debugging)
     */
    async getRawPermissions(userId: ID): Promise<string[]> {
        const key = CacheKey.permCodes(userId)
        if (!await rExists(key)) {
            await this.loadForUser(userId)
        }
        return await rSmembers(key)
    }
}

export const permissionService = new PermissionService()
