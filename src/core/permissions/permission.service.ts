import { query, queryOne } from "@/configs/db"
import { rSadd, rIsMember, rSmembers, rGetJson, rSetJson, rDel, rExists } from "@/configs/redis"
import { expandAll, expandPattern } from "./wildcardExpand"
import { CacheKey, CacheTTL} from "../cache/cacheKey"
import { UUID, AuthUser, UserScope } from "@/types"

interface StoredPermission {
    code: string
    scope_type: string
    scope_unit_id: UUID | null
}

export class PermissionService {
    /**
     * Load tất cả permissions + scopes của user vào cache
     * Called sau khi login
     */
    async loadForUser(userId: UUID): Promise<void> {
        const rows = await query<StoredPermission>(
            `SELECT p.code, ur.scope_type, ur.scope_unit_id
            FROM user_roles ur
            JOIN role_permissions rp ON rp.role_id = ur.role_id
            JOIN permissions p ON p.code = rp.permission_code
            WHERE ur.user_id = $1 AND ur.expires_at IS NULL AND p.is_active = TRUE`,
            [userId]
        )

        const permCodes = rows.map(r => r.code)
        const scopes: UserScope[] = rows.map(r => ({
            scopeType: r.scope_type as UserScope['scopeType'],
            unitId: r.scope_unit_id
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
    async hasPermission(userId: UUID, permissionCode: string): Promise<boolean> {
        const key = CacheKey.permCodes(userId)
        if (!await rExists(key)) {
            await this.loadForUser(userId)
        }
        return await rIsMember(key, permissionCode)
    }

    /**
     * Check user có bất kỳ permission nào trong danh sách không
     */
    async hasAnyPermission(userId: UUID, permissionCodes: string[]): Promise<boolean> {
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
    async hasAllPermissions(userId: UUID, permissionCodes: string[]): Promise<boolean> {
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
    async getScopes(userId: UUID): Promise<UserScope[]> {
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
    async getScopesForUser(userId: UUID): Promise<UserScope[]> {
        return await this.getScopes(userId)
    }

    /**
     * Invalidate cache permissions của user
     * Called khi có thay đổi role/permission
     */
    async invalidate(userId: UUID): Promise<void> {
        await rDel(CacheKey.permCodes(userId))
        await rDel(CacheKey.permScopes(userId))
    }

    /**
     * Đảm bảo role có permission cụ thể (dùng cho admin)
     */
    async ensureRoleHasPerm(roleId: UUID, permissionCode: string): Promise<void> {
        await query(
            `INSERT INTO role_permissions (role_id, permission_code)
            VALUES ($1, $2)
            ON CONFLICT (role_id, permission_code) DO NOTHING`,
            [roleId, permissionCode]
        )
    }

    /**
     * Grant permission cho role
     */
    async grantPermissionToRole(roleId: UUID, permissionCode: string): Promise<void> {
        await this.ensureRoleHasPerm(roleId, permissionCode)
        // Invalidate cache của tất cả user có role này
        await this.invalidateUsersWithRole(roleId)
    }

    /**
     * Revoke permission khỏi role
     */
    async revokePermissionFromRole(roleId: UUID, permissionCode: string): Promise<void> {
        await query(
            `DELETE FROM role_permissions
            WHERE role_id = $1 AND permission_code = $2`,
            [roleId, permissionCode]
        )
        await this.invalidateUsersWithRole(roleId)
    }

    /**
     * Invalidate cache của tất cả user có role cụ thể
     */
    async invalidateUsersWithRole(roleId: UUID): Promise<void> {
        const rows = await query<{ user_id: UUID }>(
            'SELECT DISTINCT user_id FROM user_roles WHERE role_id = $1 AND expires_at IS NULL',
            [roleId]
        )
        for (const row of rows) {
            await this.invalidate(row.user_id)
        }
    }

    /**
     * Alias for invalidateUsersWithRole to match invalidation service usage
     */
    async invalidateByRole(roleId: UUID): Promise<void> {
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
    async getRawPermissions(userId: UUID): Promise<string[]> {
        const key = CacheKey.permCodes(userId)
        if (!await rExists(key)) {
            await this.loadForUser(userId)
        }
        return await rSmembers(key)
    }
}

export const permissionService = new PermissionService()