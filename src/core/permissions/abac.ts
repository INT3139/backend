import { db } from "@/configs/db";
import { resourceScopes } from "@/db/schema/core";
import { eq, and, sql } from "drizzle-orm";
import { ID, UserScope, ResourceScope } from "@/types";
import { rGetJson, rSetJson } from "@/configs/redis";
import { CacheKey, CacheTTL } from "../cache/cacheKey";

export class AbacService {
    /**
     * Check xem user có quyền truy cập resource không, dựa trên scopes.
     *
     * Fix 1: 'self' scope phải compare ownerId với userId (người đang request),
     *         không phải s.unitId — unitId là org unit, không phải user id.
     *
     * Fix 2: getUnitIds() trả về mảng thay vì scalar để hỗ trợ multi-role.
     */
    async canAccess(
        userId: ID,
        userScopes: UserScope[],
        resourceType: string,
        resourceId: ID
    ): Promise<boolean> {
        // Fast path: school scope grants universal access — skip DB lookup
        if (userScopes.some((s) => s.scopeType === "school")) return true;

        const [row] = await db
            .select({
                ownerId: resourceScopes.ownerId,
                unitId: resourceScopes.unitId,
            })
            .from(resourceScopes)
            .where(
                and(
                    eq(resourceScopes.resourceType, resourceType),
                    eq(resourceScopes.resourceId, resourceId)
                )
            )
            .limit(1);

        // Resource chưa được đăng ký scope → deny by default
        if (!row) return false;

        const { ownerId, unitId } = row;

        const checks = await Promise.all(
            userScopes.map(async (s) => {
                // self scope: chỉ truy cập resource mà mình là owner
                if (s.scopeType === "self") return ownerId === userId;

                // faculty / department scope: resource phải thuộc đúng đơn vị
                // hoặc bất kỳ đơn vị con nào của đơn vị đó (kiểm tra đệ quy)
                if (s.scopeType === "faculty" || s.scopeType === "department") {
                    if (s.unitId === null || unitId === null) return false;
                    const descendants = await this.getDescendantUnitIds(s.unitId);
                    return descendants.has(unitId);
                }

                return false;
            })
        );

        return checks.some(Boolean);
    }

    /**
     * Trả về Set các unit ID là bản thân rootId và tất cả các đơn vị con (đệ quy).
     * Kết quả được cache trong Redis để tránh query lặp.
     */
    private async getDescendantUnitIds(rootId: ID): Promise<Set<ID>> {
        const cacheKey = CacheKey.orgDescendants(rootId);
        const cached = await rGetJson<number[]>(cacheKey);
        if (cached) return new Set(cached);

        const result = await db.execute<{ id: number }>(sql`
            WITH RECURSIVE tree AS (
                SELECT id FROM organizational_units WHERE id = ${rootId}
                UNION ALL
                SELECT ou.id
                FROM organizational_units ou
                JOIN tree t ON ou.parent_id = t.id
            )
            SELECT id FROM tree
        `);

        const ids = result.rows.map((r) => r.id as ID);
        await rSetJson(cacheKey, ids, CacheTTL.ORG_TREE);
        return new Set(ids);
    }

    async registerScope(scope: ResourceScope): Promise<void> {
        await db
            .insert(resourceScopes)
            .values({
                resourceType: scope.resourceType,
                resourceId: scope.resourceId,
                ownerId: scope.ownerId,
                unitId: scope.unitId,
            })
            .onConflictDoUpdate({
                target: [resourceScopes.resourceType, resourceScopes.resourceId],
                set: {
                    ownerId: scope.ownerId,
                    unitId: scope.unitId,
                },
            });
    }

    async updateScope(
        type: string,
        id: ID,
        updates: Partial<ResourceScope>
    ): Promise<void> {
        const set: Partial<{ ownerId: ID | null; unitId: ID | null }> = {};
        if (updates.ownerId !== undefined) set.ownerId = updates.ownerId;
        if (updates.unitId !== undefined) set.unitId = updates.unitId;
        if (Object.keys(set).length === 0) return;

        await db
            .update(resourceScopes)
            .set(set)
            .where(
                and(
                    eq(resourceScopes.resourceType, type),
                    eq(resourceScopes.resourceId, id)
                )
            );
    }

    async removeScope(type: string, id: ID): Promise<void> {
        await db
            .delete(resourceScopes)
            .where(
                and(
                    eq(resourceScopes.resourceType, type),
                    eq(resourceScopes.resourceId, id)
                )
            );
    }

    /**
     * Trả về danh sách unit IDs mà user có quyền filter.
     *
     * Fix: trả về ID[] thay vì scalar để hỗ trợ trường hợp user có nhiều
     * role với nhiều scope unit khác nhau (ví dụ faculty_leader + dept_head).
     *
     * Caller dùng:
     *   const unitIds = await abacService.getUnitIds(scopes)
     *   if (unitIds === 'all') { /* no filter *\/ }
     *   else { query.where(inArray(table.unitId, unitIds)) }
     */
    async getUnitIds(scopes: UserScope[]): Promise<ID[] | "all"> {
        if (scopes.some((s) => s.scopeType === "school")) return "all";

        const rootIds = scopes
            .filter((s) => s.scopeType === "faculty" || s.scopeType === "department")
            .map((s) => s.unitId)
            .filter((id): id is ID => id !== null);

        if (rootIds.length === 0) return [];

        const allIds = new Set<ID>();
        for (const rootId of rootIds) {
            const descendants = await this.getDescendantUnitIds(rootId);
            descendants.forEach((id) => allIds.add(id));
        }

        return [...allIds];
    }

    /**
     * @deprecated Dùng getUnitIds() thay thế để hỗ trợ multi-role.
     * Giữ lại để không break caller cũ.
     */
    async getUnitFilter(scopes: UserScope[]): Promise<ID | null | "all"> {
        if (scopes.some((s) => s.scopeType === "school")) return "all";
        return (
            scopes.find(
                (s) => s.scopeType === "faculty" || s.scopeType === "department"
            )?.unitId ?? null
        );
    }
}

export const abacService = new AbacService();