import { queryOne, query } from "@/configs/db";
import { UUID, UserScope, ResourceScope } from "@/types";

export class AbacService {
    async canAccess(
        userScopes: UserScope[],
        resourceType: string,
        resourceId: UUID,
    ): Promise<boolean> {
        const row = await queryOne<{ 
            owner_id: string|null; 
            unit_id: string|null 
        }>(
            'SELECT owner_id, unit_id FROM resource_scopes WHERE resource_type=$1 AND resource_id=$2', 
            [resourceType, resourceId]
        )
        if (!row) {
            return false;
        }

        const { owner_id, unit_id } = row;

        return userScopes.some(s => {
            (s.scopeType === 'faculty' || s.scopeType === 'department') && s.unitId === unit_id
        })
    }

    async registerScope(scope: ResourceScope) : Promise<void> {
        await query(
            `INSERT INTO resource_scopes (resource_type,resource_id,owner_id,unit_id) VALUES ($1,$2,$3,$4)
            ON CONFLICT (resource_type,resource_id) DO UPDATE SET owner_id=$3, unit_id=$4`,
            [scope.resourceType, scope.resourceId, scope.ownerId, scope.unitId]
        )
    }

    async updateScope(type: string, id: UUID, updates: Partial<ResourceScope>): Promise<void> {
        const parts: string[] = []; 
        const params: unknown[] = []; 
        let i = 1;
        if (updates.ownerId !== undefined) { parts.push(`owner_id=$${i++}`); params.push(updates.ownerId) }
        if (updates.unitId  !== undefined) { parts.push(`unit_id=$${i++}`);  params.push(updates.unitId) }
        if (!parts.length) return
        params.push(type, id)
        await query(`UPDATE resource_scopes SET ${parts.join(',')} WHERE resource_type=$${i} AND resource_id=$${i+1}`, params)
    }

    async removeScope(type: string, id: UUID): Promise<void> {
        await query('DELETE FROM resource_scopes WHERE resource_type=$1 AND resource_id=$2', [type, id])
    }

    async getUnitFilter(scopes: UserScope[]): Promise<UUID | null | 'all'> {
        if (scopes.some(s => s.scopeType === 'school')) return 'all'
        return scopes.find(s => s.scopeType === 'faculty' || s.scopeType === 'department')?.unitId ?? null
    }
}

export const abacService = new AbacService();