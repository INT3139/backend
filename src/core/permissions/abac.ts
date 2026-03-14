import { db } from "@/configs/db";
import { resourceScopes } from "@/db/schema/core";
import { eq, and } from "drizzle-orm";
import { ID, UserScope, ResourceScope } from "@/types";

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

        return userScopes.some((s) => {
            // school scope: toàn quyền
            if (s.scopeType === "school") return true;

            // self scope: chỉ truy cập resource mà mình là owner
            // Fix: compare ownerId với userId của requester, không phải s.unitId
            if (s.scopeType === "self") return ownerId === userId;

            // faculty / department scope: resource phải thuộc đúng đơn vị
            if (s.scopeType === "faculty" || s.scopeType === "department") {
                return s.unitId !== null && s.unitId === unitId;
            }

            return false;
        });
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

        const ids = scopes
            .filter((s) => s.scopeType === "faculty" || s.scopeType === "department")
            .map((s) => s.unitId)
            .filter((id): id is ID => id !== null);

        return [...new Set(ids)];
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