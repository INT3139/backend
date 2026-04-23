import { db } from "@/configs/db";
import { userRoles, rolePermissions, roles } from "@/db/schema/auth";
import { eq, and, isNull, inArray } from "drizzle-orm";
import {
    rSadd,
    rIsMember,
    rSmembers,
    rGetJson,
    rSetJson,
    rDel,
    rExists,
    rDelPattern,
} from "@/configs/redis";
import { expandAll } from "./wildcardExpand";
import { CacheKey, CacheTTL } from "../cache/cacheKey";
import { AuthUser, ID, UserScope } from "@/types";

export class PermissionService {
    /**
     * Load permissions + scopes of user into Redis cache.
     */
    async loadForUser(user: ID | AuthUser): Promise<void> {
        const userId = typeof user === 'number' ? user : user.id;
        const port = typeof user === 'number' ? undefined : user.port;
        const activeRoles = typeof user === 'number' ? undefined : user.activeRoles;

        // Base query
        let query = db
            .select({
                permCode: rolePermissions.permissionCode,
                scopeType: userRoles.scopeType,
                scopeUnitId: userRoles.scopeUnitId,
            })
            .from(userRoles)
            .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
            .$dynamic();

        // Filter by active roles if provided (Port-based security)
        if (activeRoles && activeRoles.length > 0) {
            query = query
                .innerJoin(roles, eq(userRoles.roleId, roles.id))
                .where(
                    and(
                        eq(userRoles.userId, userId),
                        isNull(userRoles.expiresAt),
                        inArray(roles.code, activeRoles)
                    )
                );
        } else {
            query = query.where(
                and(eq(userRoles.userId, userId), isNull(userRoles.expiresAt))
            );
        }

        const rows = await query;

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
        const codesKey = CacheKey.permCodes(userId, port);
        await rDel(codesKey);
        if (expandedCodes.length > 0) {
            await rSadd(codesKey, expandedCodes, CacheTTL.PERM_CODES);
        }

        // Cache scopes (Redis JSON)
        const scopesKey = CacheKey.permScopes(userId, port);
        await rSetJson(scopesKey, scopes, CacheTTL.PERM_SCOPES);
    }

    /**
     * Check xem user có permission cụ thể không.
     */
    async hasPermission(user: ID | AuthUser, permissionCode: string): Promise<boolean> {
        const userId = typeof user === 'number' ? user : user.id;
        const port = typeof user === 'number' ? undefined : user.port;

        const key = CacheKey.permCodes(userId, port);
        if (!(await rExists(key))) {
            await this.loadForUser(user);
        }
        return rIsMember(key, permissionCode);
    }

    /**
     * Check user có bất kỳ permission nào trong danh sách không.
     */
    async hasAnyPermission(
        user: ID | AuthUser,
        permissionCodes: string[]
    ): Promise<boolean> {
        const results = await Promise.all(
            permissionCodes.map((c) => this.hasPermission(user, c))
        );
        return results.some(Boolean);
    }

    /**
     * Check user có tất cả permissions trong danh sách không.
     */
    async hasAllPermissions(
        user: ID | AuthUser,
        permissionCodes: string[]
    ): Promise<boolean> {
        const results = await Promise.all(
            permissionCodes.map((c) => this.hasPermission(user, c))
        );
        return results.every(Boolean);
    }

    /**
     * Lấy scopes của user từ cache.
     */
    async getScopes(user: ID | AuthUser): Promise<UserScope[]> {
        const userId = typeof user === 'number' ? user : user.id;
        const port = typeof user === 'number' ? undefined : user.port;

        const key = CacheKey.permScopes(userId, port);
        const cached = await rGetJson<UserScope[]>(key);
        if (cached) return cached;
        await this.loadForUser(user);
        return (await rGetJson<UserScope[]>(key)) ?? [];
    }

    /** Alias for getScopes */
    async getScopesForUser(user: ID | AuthUser): Promise<UserScope[]> {
        return this.getScopes(user);
    }

    /**
     * Invalidate cache permissions của user.
     * Gọi khi có thay đổi role/permission assignment.
     */
    async invalidate(userId: ID): Promise<void> {
        await rDelPattern(`perm:*:${userId}*`);
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
    async getRawPermissions(user: ID | AuthUser): Promise<string[]> {
        const userId = typeof user === 'number' ? user : user.id;
        const port = typeof user === 'number' ? undefined : user.port;

        const key = CacheKey.permCodes(userId, port);
        if (!(await rExists(key))) {
            await this.loadForUser(user);
        }
        return rSmembers(key);
    }
}

export const permissionService = new PermissionService();