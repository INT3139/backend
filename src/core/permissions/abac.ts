import { db } from "@/configs/db";
import { resourceScopes } from "@/db/schema/core";
import { eq, and } from "drizzle-orm";
import { ID, UserScope, ResourceScope } from "@/types";

export class AbacService {
    async canAccess(
        userScopes: UserScope[],
        resourceType: string,
        resourceId: ID,
    ): Promise<boolean> {
        const [row] = await db.select({
            ownerId: resourceScopes.ownerId,
            unitId: resourceScopes.unitId
        })
        .from(resourceScopes)
        .where(and(
            eq(resourceScopes.resourceType, resourceType),
            eq(resourceScopes.resourceId, resourceId)
        ))
        .limit(1);

        if (!row) {
            return false;
        }

        const { ownerId, unitId } = row;

        return userScopes.some(s => {
            return (s.scopeType === 'faculty' || s.scopeType === 'department') && s.unitId === unitId
        })
    }

    async registerScope(scope: ResourceScope) : Promise<void> {
        await db.insert(resourceScopes)
            .values({
                resourceType: scope.resourceType,
                resourceId: scope.resourceId,
                ownerId: scope.ownerId,
                unitId: scope.unitId
            })
            .onConflictDoUpdate({
                target: [resourceScopes.resourceType, resourceScopes.resourceId],
                set: {
                    ownerId: scope.ownerId,
                    unitId: scope.unitId
                }
            })
    }

    async updateScope(type: string, id: ID, updates: Partial<ResourceScope>): Promise<void> {
        const set: any = {}
        if (updates.ownerId !== undefined) set.ownerId = updates.ownerId
        if (updates.unitId !== undefined) set.unitId = updates.unitId
        if (Object.keys(set).length === 0) return

        await db.update(resourceScopes)
            .set(set)
            .where(and(
                eq(resourceScopes.resourceType, type),
                eq(resourceScopes.resourceId, id)
            ))
    }

    async removeScope(type: string, id: ID): Promise<void> {
        await db.delete(resourceScopes)
            .where(and(
                eq(resourceScopes.resourceType, type),
                eq(resourceScopes.resourceId, id)
            ))
    }

    async getUnitFilter(scopes: UserScope[]): Promise<ID | null | 'all'> {
        if (scopes.some(s => s.scopeType === 'school')) return 'all'
        return scopes.find(s => s.scopeType === 'faculty' || s.scopeType === 'department')?.unitId ?? null
    }
}

export const abacService = new AbacService();