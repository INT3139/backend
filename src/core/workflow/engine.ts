import { query, queryOne, withTransaction } from "@/configs/db";
import { cacheService } from "../cache/cache.service";
import { CacheKey, CacheTTL } from "../cache/cacheKey";
import { UUID, WorkflowStatus, WorkflowInitPayload } from "@/types";
import { NotFoundError, ForbiddenError } from "../middlewares/errorHandler";

export interface WorkflowInstance {
  id: UUID; 
  definitionId: UUID; 
  resourceType: string; 
  resourceId: UUID
  status: WorkflowStatus; 
  currentStep: number; 
  startedAt: Date; 
  completedAt?: Date
}

export class WorkflowEngine {
  async getDefinition(code: string) {
    return cacheService.getOrSet(CacheKey.workflowDefinition(code), CacheTTL.WORKFLOW_DEF, async () => {
      const row = await queryOne<{ id: string; steps: any[] }>('SELECT id,steps FROM wf_definitions WHERE code=$1 AND is_active=TRUE', [code])
      if (!row) throw new NotFoundError(`Workflow definition: ${code}`)
      return row
    })
  }

  async initiate(p: WorkflowInitPayload): Promise<WorkflowInstance> {
    const def = await this.getDefinition(p.definitionCode)
    const rows = await query<WorkflowInstance>(
      `INSERT INTO wf_instances (definition_id,resource_type,resource_id,initiated_by,status,current_step,metadata,due_at)
       VALUES ($1,$2,$3,$4,'in_progress',1,$5::jsonb,$6) RETURNING *`,
      [def.id, p.resourceType, p.resourceId, p.initiatedBy, JSON.stringify(p.metadata ?? {}), p.dueAt ?? null]
    )
    const inst = rows[0]
    await query(`INSERT INTO wf_step_logs (instance_id,step_number,step_name,actor_id,action) VALUES ($1,1,$2,$3,'forward')`,
      [inst.id, (def.steps[0] as any)?.name ?? 'Step 1', p.initiatedBy])
    return inst
  }

  async advance(instanceId: UUID, actorId: UUID, action: 'approve'|'reject'|'request_revision'|'forward', comment?: string): Promise<WorkflowInstance> {
    return withTransaction(async (client) => {
      const inst = await client.query<WorkflowInstance>('SELECT * FROM wf_instances WHERE id=$1 FOR UPDATE', [instanceId]).then(r => r.rows[0])
      if (!inst) throw new NotFoundError('Workflow instance')
      if (inst.status !== 'in_progress') throw new ForbiddenError('Workflow not in progress')

      const def = await this.getDefinition('')
      const nextStep = inst.currentStep + 1
      const isLast   = nextStep > def.steps.length
      const newStatus: WorkflowStatus = action === 'reject' ? 'rejected' : (isLast ? 'approved' : 'in_progress')

      await client.query('UPDATE wf_instances SET current_step=$1,status=$2,completed_at=$3 WHERE id=$4',
        [isLast || action === 'reject' ? inst.currentStep : nextStep, newStatus, newStatus !== 'in_progress' ? new Date() : null, inst.id])
      await client.query('INSERT INTO wf_step_logs (instance_id,step_number,step_name,actor_id,action,comment) VALUES ($1,$2,$3,$4,$5,$6)',
        [inst.id, inst.currentStep, `Step ${inst.currentStep}`, actorId, action, comment ?? null])

      await cacheService.invalidateWorkflowInstance(inst.id)
      return { ...inst, status: newStatus }
    })
  }

  async getStatus(id: UUID): Promise<WorkflowInstance> {
    return cacheService.getOrSet(CacheKey.workflowInstance(id), CacheTTL.WORKFLOW_INSTANCE, async () => {
      const row = await queryOne<WorkflowInstance>('SELECT * FROM wf_instances WHERE id=$1', [id])
      if (!row) throw new NotFoundError('Workflow instance')
      return row
    })
  }

  async getHistory(id: UUID)  { return query('SELECT * FROM wf_step_logs WHERE instance_id=$1 ORDER BY acted_at ASC', [id]) }
  async cancel(id: UUID, actorId: UUID, reason: string) {
    await query('UPDATE wf_instances SET status=$1,completed_at=now() WHERE id=$2', ['cancelled', id])
    await query("INSERT INTO wf_step_logs (instance_id,step_number,step_name,actor_id,action,comment) VALUES ($1,0,'Cancelled',$2,'reject',$3)", [id, actorId, reason])
    await cacheService.invalidateWorkflowInstance(id)
  }
}

export const workflowEngine = new WorkflowEngine()
