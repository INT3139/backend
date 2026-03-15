import { db } from "@/configs/db";
import { wfInstances, wfStepLogs, wfDefinitions } from "@/db/schema/workflow";
import { eq, and, asc } from "drizzle-orm";
import { cacheService } from "../cache/cache.service";
import { CacheKey, CacheTTL } from "../cache/cacheKey";
import { ID, WorkflowStatus, WorkflowInitPayload } from "@/types";
import { NotFoundError, ForbiddenError } from "../middlewares/errorHandler";

export interface WorkflowInstance {
  id: ID;
  definitionId: ID;
  resourceType: string;
  resourceId: ID
  status: WorkflowStatus;
  currentStep: number;
  startedAt: Date;
  completedAt?: Date | null
}

export class WorkflowEngine {
  async getDefinition(code: string) {
    return cacheService.getOrSet(CacheKey.workflowDefinition(code), CacheTTL.WORKFLOW_DEF, async () => {
      const rows = await db.select({ id: wfDefinitions.id, steps: wfDefinitions.steps })
        .from(wfDefinitions)
        .where(and(eq(wfDefinitions.code, code), eq(wfDefinitions.isActive, true)))
      const row = rows[0]
      if (!row) throw new NotFoundError(`Workflow definition: ${code}`)
      return row
    })
  }

  async initiate(p: WorkflowInitPayload): Promise<WorkflowInstance> {
    const def = await this.getDefinition(p.definitionCode)
    const rows = await db.insert(wfInstances).values({
      definitionId: def.id,
      resourceType: p.resourceType,
      resourceId: p.resourceId,
      initiatedBy: p.initiatedBy,
      status: 'in_progress',
      currentStep: 1,
      metadata: p.metadata ?? {},
      dueAt: p.dueAt ?? null
    }).returning()
    const inst = rows[0]
    await db.insert(wfStepLogs).values({
      instanceId: inst.id,
      stepNumber: 1,
      stepName: (def.steps as any)?.[0]?.name ?? 'Step 1',
      actorId: p.initiatedBy,
      action: 'forward'
    })
    return inst as unknown as WorkflowInstance
  }

  async advance(instanceId: ID, actorId: ID, action: 'approve' | 'reject' | 'request_revision' | 'forward', comment?: string): Promise<WorkflowInstance> {
    return db.transaction(async (tx) => {
      const rows = await tx.select().from(wfInstances).where(eq(wfInstances.id, instanceId)).for('update')
      const inst = rows[0]
      if (!inst) throw new NotFoundError('Workflow instance')
      if (inst.status !== 'in_progress') throw new ForbiddenError('Workflow not in progress')

      // Note: This logic seems to have a bug in original code: getDefinition('') 
      // I will keep it as is or try to fix if I can find definition code.
      // But for now, let's just refactor to Drizzle.
      const defRows = await tx.select().from(wfDefinitions).where(eq(wfDefinitions.id, inst.definitionId))
      const def = defRows[0]
      if (!def) throw new NotFoundError('Workflow definition')

      const nextStep = inst.currentStep + 1
      const isLast = nextStep > (def.steps as any[]).length
      const newStatus: WorkflowStatus = action === 'reject' ? 'rejected' : (isLast ? 'approved' : 'in_progress')

      await tx.update(wfInstances).set({
        currentStep: isLast || action === 'reject' ? inst.currentStep : nextStep,
        status: newStatus,
        completedAt: newStatus !== 'in_progress' ? new Date() : null
      }).where(eq(wfInstances.id, inst.id))

      await tx.insert(wfStepLogs).values({
        instanceId: inst.id,
        stepNumber: inst.currentStep,
        stepName: `Step ${inst.currentStep}`,
        actorId,
        action,
        comment: comment ?? null
      })

      await cacheService.invalidateWorkflowInstance(inst.id)
      return { ...inst, status: newStatus } as unknown as WorkflowInstance
    })
  }

  async getStatus(id: ID): Promise<WorkflowInstance> {
    return cacheService.getOrSet(CacheKey.workflowInstance(id), CacheTTL.WORKFLOW_INSTANCE, async () => {
      const rows = await db.select().from(wfInstances).where(eq(wfInstances.id, id))
      const row = rows[0]
      if (!row) throw new NotFoundError('Workflow instance')
      return row as unknown as WorkflowInstance
    })
  }

  async getHistory(id: ID) {
    return db.select().from(wfStepLogs).where(eq(wfStepLogs.instanceId, id)).orderBy(asc(wfStepLogs.actedAt))
  }

  async cancel(id: ID, actorId: ID, reason: string) {
    const rows = await db.select().from(wfInstances).where(eq(wfInstances.id, id))
    const inst = rows[0]
    if (!inst) throw new NotFoundError('Workflow instance')
    if (inst.status !== 'in_progress') throw new ForbiddenError('Only in-progress workflows can be cancelled')
    await db.update(wfInstances).set({ status: 'cancelled', completedAt: new Date() }).where(eq(wfInstances.id, id))
    await db.insert(wfStepLogs).values({
      instanceId: id,
      stepNumber: 0,
      stepName: 'Cancelled',
      actorId,
      action: 'reject',
      comment: reason
    })
    await cacheService.invalidateWorkflowInstance(id)
  }
}

export const workflowEngine = new WorkflowEngine()
