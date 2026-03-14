import { db } from "@/configs/db";
import { userRoles, rolePermissions } from "@/db/schema/auth";
import { eq, and, isNull } from "drizzle-orm";
import {
    rSadd,
    rIsMember,
    rSmembers,
    rGetJson,
    rSetJson,
    rDel,
    rExists,
} from "@/configs/redis";
import { expandAll } from "./wildcardExpand";
import { CacheKey, CacheTTL } from "../cache/cacheKey";
import { ID, UserScope } from "@/types";

export class PermissionService {
    /**
     * Load tất cả permissions + scopes của user vào Redis cache.
     * Gọi sau khi login hoặc khi cache miss.
     *
     * Fix: KHÔNG innerJoin bảng permissions trong query này.
     * role_permissions.permission_code chứa wildcard patterns ('hrm.*', 'hrm.profile.*', ...)
     * không có row nào trong bảng permissions có code = 'hrm.*',
     * nên innerJoin sẽ luôn trả về 0 rows → mọi user bị 403.
     *
     * Đúng flow:
     *   1. Lấy raw patterns từ role_permissions (không join permissions)
     *   2. Expand wildcards → exact permission codes
     *   3. Cache expanded codes vào Redis set
     */
    async loadForUser(userId: ID): Promise<void> {
        // Bước 1: lấy raw patterns + scopes, không join permissions table
        const rows = await db
            .select({
                permCode: rolePermissions.permissionCode,
                scopeType: userRoles.scopeType,
                scopeUnitId: userRoles.scopeUnitId,
            })
            .from(userRoles)
            .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
            .where(
                and(eq(userRoles.userId, userId), isNull(userRoles.expiresAt))
            );

        // Bước 2: expand wildcard patterns thành exact codes
        const rawPatterns = [...new Set(rows.map((r) => r.permCode))];
        const expandedCodes = await expandAll(rawPatterns);

        // Bước 3: deduplicate scopes
        const seen = new Set<string>();
        const scopes: UserScope[] = [];
        for (const r of rows) {
            const key = `${r.scopeType}:${r.scopeUnitId ?? "null"}`;
            if (!seen.has(key)) {
                seen.add(key);
                scopes.push({
                    scopeType: r.scopeType as UserScope["scopeType"],
                    unitId: r.scopeUnitId as ID | null,
                });
            }
        }

        // Cache permission codes (Redis Set)
        const codesKey = CacheKey.permCodes(userId);
        await rDel(codesKey);
        if (expandedCodes.length > 0) {
            await rSadd(codesKey, expandedCodes, CacheTTL.PERM_CODES);
        }

        // Cache scopes (Redis JSON)
        const scopesKey = CacheKey.permScopes(userId);
        await rSetJson(scopesKey, scopes, CacheTTL.PERM_SCOPES);
    }

    /**
     * Check xem user có permission cụ thể không.
     * Cache miss → tự load.
     */
    async hasPermission(userId: ID, permissionCode: string): Promise<boolean> {
        const key = CacheKey.permCodes(userId);
        if (!(await rExists(key))) {
            await this.loadForUser(userId);
        }
        return rIsMember(key, permissionCode);
    }

    /**
     * Check user có bất kỳ permission nào trong danh sách không.
     */
    async hasAnyPermission(
        userId: ID,
        permissionCodes: string[]
    ): Promise<boolean> {
        // Dùng Promise.all thay vì vòng lặp await tuần tự để giảm latency
        const results = await Promise.all(
            permissionCodes.map((c) => this.hasPermission(userId, c))
        );
        return results.some(Boolean);
    }

    /**
     * Check user có tất cả permissions trong danh sách không.
     */
    async hasAllPermissions(
        userId: ID,
        permissionCodes: string[]
    ): Promise<boolean> {
        const results = await Promise.all(
            permissionCodes.map((c) => this.hasPermission(userId, c))
        );
        return results.every(Boolean);
    }

    /**
     * Lấy scopes của user từ cache.
     */
    async getScopes(userId: ID): Promise<UserScope[]> {
        const key = CacheKey.permScopes(userId);
        const cached = await rGetJson<UserScope[]>(key);
        if (cached) return cached;
        await this.loadForUser(userId);
        return (await rGetJson<UserScope[]>(key)) ?? [];
    }

    /** Alias for getScopes */
    async getScopesForUser(userId: ID): Promise<UserScope[]> {
        return this.getScopes(userId);
    }

    /**
     * Invalidate cache permissions của user.
     * Gọi khi có thay đổi role/permission assignment.
     */
    async invalidate(userId: ID): Promise<void> {
        await Promise.all([
            rDel(CacheKey.permCodes(userId)),
            rDel(CacheKey.permScopes(userId)),
        ]);
    }

    async ensureRoleHasPerm(roleId: ID, permissionCode: string): Promise<void> {
        await db
            .insert(rolePermissions)
            .values({ roleId, permissionCode })
            .onConflictDoNothing();
    }

    async grantPermissionToRole(
        roleId: ID,
        permissionCode: string
    ): Promise<void> {
        await this.ensureRoleHasPerm(roleId, permissionCode);
        await this.invalidateUsersWithRole(roleId);
    }

    async revokePermissionFromRole(
        roleId: ID,
        permissionCode: string
    ): Promise<void> {
        await db
            .delete(rolePermissions)
            .where(
                and(
                    eq(rolePermissions.roleId, roleId),
                    eq(rolePermissions.permissionCode, permissionCode)
                )
            );
        await this.invalidateUsersWithRole(roleId);
    }

    async invalidateUsersWithRole(roleId: ID): Promise<void> {
        const rows = await db
            .select({ userId: userRoles.userId })
            .from(userRoles)
            .where(and(eq(userRoles.roleId, roleId), isNull(userRoles.expiresAt)));

        const userIds = [...new Set(rows.map((r) => r.userId))];
        await Promise.all(userIds.map((uid) => this.invalidate(uid)));
    }

    /** Alias for invalidateUsersWithRole */
    async invalidateByRole(roleId: ID): Promise<void> {
        return this.invalidateUsersWithRole(roleId);
    }

    async expandPermissions(patterns: string[]): Promise<string[]> {
        return expandAll(patterns);
    }

    /** Lấy permissions raw của user — dùng cho debugging */
    async getRawPermissions(userId: ID): Promise<string[]> {
        const key = CacheKey.permCodes(userId);
        if (!(await rExists(key))) {
            await this.loadForUser(userId);
        }
        return rSmembers(key);
    }
}

export const permissionService = new PermissionService();