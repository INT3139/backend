import { query } from "@/configs/db";
import { UUID } from "@/types";

export class AuditService {
    async log(
        actorId: UUID | null,
        action: string, 
        resourceType: string,
        resourceId?: UUID | null,
        metadata?: Record<string, any>,
        ip?: string
    ): Promise<void> {
        await query(
            `INSERT INTO sys_audit_logs (actor_id,action,resource_type,resource_id,new_values,actor_ip) VALUES ($1,$2,$3,$4,$5::jsonb,$6::inet)`,
            [
                actorId, 
                action, 
                resourceType, 
                resourceId??null, 
                metadata?JSON.stringify(metadata):null, 
                ip??null
            ]
        );
    }

    async queryLogs(filter: {
        actorId?: UUID; 
        resourceType?: string; 
        resourceId?: string; 
        action?: string; 
        from?: Date; to?: Date; 
        page?: number; limit?: number
    }) {
        const conds = ['1=1']; 
        const params: unknown[] = []; 
        let i = 1

        if (filter.actorId)      { 
            conds.push(`actor_id=$${i++}`);       
            params.push(filter.actorId) 
        }
        if (filter.resourceType) { 
            conds.push(`resource_type=$${i++}`);  
            params.push(filter.resourceType) 
        }
        if (filter.resourceId) { 
            conds.push(`resource_id=$${i++}`);    
            params.push(filter.resourceId) 
        }
        if (filter.action) { 
            conds.push(`action=$${i++}`);         
            params.push(filter.action) 
        }
        if (filter.from) { 
            conds.push(`event_time>=$${i++}`);    
            params.push(filter.from) 
        }
        if (filter.to) { 
            conds.push(`event_time<=$${i++}`);    
            params.push(filter.to) 
        }

        const limit = filter.limit ?? 50; 
        const offset = ((filter.page ?? 1) - 1) * limit;
        return query(`SELECT * FROM sys_audit_logs WHERE ${conds.join(' AND ')} ORDER BY event_time DESC LIMIT ${limit} OFFSET ${offset}`, params)
    }

    async getObjectHistory(type: string, id: string) { 
        return query('SELECT * FROM sys_audit_logs WHERE resource_type=$1 AND resource_id=$2 ORDER BY event_time DESC', 
            [type, id]) 
        }
    async getUserActivity(userId: UUID, from?: Date, to?: Date) { 
        return this.queryLogs({ 
            actorId: userId, 
            from, 
            to, 
            limit: 100 
        })}
}

export const auditService = new AuditService()
