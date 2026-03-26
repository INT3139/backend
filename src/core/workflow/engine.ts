import { db } from '@/configs/db'
import { wfInstances, wfStepLogs, wfDefinitions } from '@/db/schema/workflow'
import { userRoles as userRolesTable } from '@/db/schema/auth'
import { eq, and, asc, sql } from 'drizzle-orm'
import { cacheService } from '../cache/cache.service'
import { CacheKey, CacheTTL } from '../cache/cacheKey'
import { ID, WorkflowStatus, WorkflowInitPayload } from '@/types'
import { NotFoundError, ForbiddenError } from '../middlewares/errorHandler'
import { permissionService } from '../permissions/permission.service'
import { dispatchWorkflowResult } from './workflow.dispatcher'

export interface WorkflowInstance {
  id: ID
  definitionId: ID
  resourceType: string
  resourceId: ID
  status: WorkflowStatus
  currentStep: number
  metadata: any
  startedAt: Date
  completedAt?: Date | null
}

interface StepDef {
  step: number
  name: string
  role_id: number
  action_type: 'approve' | 'ballot_submit' | 'forward'
  required: boolean
}

export class WorkflowEngine {
  // ----------------------------------------------------------------
  // Definition
  // ----------------------------------------------------------------

  async getDefinition(code: string) {
    return cacheService.getOrSet(
      CacheKey.workflowDefinition(code),
      CacheTTL.WORKFLOW_DEF,
      async () => {
        const [row] = await db
          .select()
          .from(wfDefinitions)
          .where(and(eq(wfDefinitions.code, code), eq(wfDefinitions.isActive, true)))
        if (!row) throw new NotFoundError(`Workflow definition: ${code}`)
        return row
      },
    )
  }

  // ----------------------------------------------------------------
  // Initiate
  // ----------------------------------------------------------------

  async initiate(p: WorkflowInitPayload, tx?: any): Promise<WorkflowInstance> {
    const def = await this.getDefinition(p.definitionCode)
    const steps = def.steps as StepDef[]

    const [inst] = await (tx || db)
      .insert(wfInstances)
      .values({
        definitionId: def.id,
        resourceType: p.resourceType,
        resourceId: p.resourceId,
        initiatedBy: p.initiatedBy,
        status: 'in_progress',
        currentStep: 1,
        metadata: p.metadata ?? {},
        dueAt: p.dueAt ?? null,
      })
      .returning()

    // Bước 1 luôn do người initiate thực hiện (forward)
    await (tx || db).insert(wfStepLogs).values({
      instanceId: inst.id,
      stepNumber: 1,
      stepName: steps[0]?.name ?? 'Khởi tạo',
      actorId: p.initiatedBy,
      action: 'forward',
      comment: null,
    })

    // Advance ngay sang step 2 vì step 1 đã complete
    const newStep = steps.length >= 2 ? 2 : 1
    const newStatus: WorkflowStatus = steps.length === 1 ? 'approved' : 'in_progress'

    await (tx || db)
      .update(wfInstances)
      .set({ currentStep: newStep, status: newStatus })
      .where(eq(wfInstances.id, inst.id))

    return { ...inst, currentStep: newStep, status: newStatus } as unknown as WorkflowInstance
  }

  // ----------------------------------------------------------------
  // Advance
  // ----------------------------------------------------------------

  async advance(
    instanceId: ID,
    actorId: ID,
    action: 'approve' | 'reject' | 'request_revision' | 'forward',
    comment?: string,
  ): Promise<WorkflowInstance> {
    return db.transaction(async (tx) => {
      // Lock row để tránh concurrent advance
      const [inst] = await tx
        .select()
        .from(wfInstances)
        .where(eq(wfInstances.id, instanceId))
        .for('update')

      if (!inst) throw new NotFoundError('Workflow instance')
      if (inst.status !== 'in_progress') {
        throw new ForbiddenError(`Workflow đang ở trạng thái: ${inst.status}`)
      }

      const [def] = await tx
        .select()
        .from(wfDefinitions)
        .where(eq(wfDefinitions.id, inst.definitionId))
      if (!def) throw new NotFoundError('Workflow definition')

      const steps = def.steps as StepDef[]

      // Fix: seed dùng "step" không phải "stepNumber"
      const currentStepDef = steps.find((s) => s.step === inst.currentStep)

      // Validate role cho bước hiện tại
      if (currentStepDef) {
        const hasAccess = await this.canActOnStep(actorId, currentStepDef)
        if (!hasAccess) {
          throw new ForbiddenError('Bạn không có quyền thực hiện bước này')
        }
      }

      // Ghi log bước hiện tại
      await tx.insert(wfStepLogs).values({
        instanceId,
        stepNumber: inst.currentStep,
        stepName: currentStepDef?.name ?? `Step ${inst.currentStep}`,
        actorId,
        action,
        comment: comment ?? null,
      })

      // Tính trạng thái mới
      const isReject = action === 'reject'
      const isRevision = action === 'request_revision'
      const nextStep = inst.currentStep + 1
      const isLast = nextStep > steps.length

      let newStatus: WorkflowStatus = inst.status
      if (isReject) {
        newStatus = 'rejected'
      } else if (isRevision) {
        newStatus = 'in_progress' // Vẫn in_progress nhưng quay về bước 1
      } else if (isLast) {
        newStatus = 'approved'
      } else {
        newStatus = 'in_progress'
      }

      const newCurrentStep = isReject || isLast 
        ? inst.currentStep 
        : isRevision 
          ? 1 
          : nextStep

      const [updatedInst] = await tx
        .update(wfInstances)
        .set({
          currentStep: newCurrentStep,
          status: newStatus,
          completedAt: (newStatus === 'approved' || newStatus === 'rejected') ? new Date() : null,
        })
        .where(eq(wfInstances.id, inst.id))
        .returning()

      if (newStatus !== 'in_progress' || isRevision) {
        await dispatchWorkflowResult(updatedInst as unknown as WorkflowInstance, actorId, tx, action)
      }

      await cacheService.invalidateWorkflowInstance(inst.id)

      return {
        ...updatedInst,
        status: newStatus,
        currentStep: newCurrentStep,
      } as unknown as WorkflowInstance
    })
  }

  /**
   * Check xem actorId có quyền xử lý stepDef không.
   * Dựa vào role_id trong step definition.
   */
  private async canActOnStep(actorId: ID, stepDef: StepDef): Promise<boolean> {
    if (!stepDef.role_id) return true  // không quy định role → ai cũng được

    // Lấy role IDs của user (query trực tiếp thay vì qua adminRepo để tránh circular)
    const rows = await db
      .select({ roleId: userRolesTable.roleId })
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, actorId))

    const roleIds = rows.map((r) => r.roleId)
    return roleIds.includes(stepDef.role_id)
  }

  // ----------------------------------------------------------------
  // My Tasks — việc cần xử lý của user hiện tại
  // ----------------------------------------------------------------

  async getMyTasks(userId: ID) {
    // Lấy role IDs của user
    const roleRows = await db
      .select({ roleId: userRolesTable.roleId })
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, userId))

    const roleIds = roleRows.map((r) => r.roleId)
    
    const results = await db
      .select({
        instance: wfInstances,
        definition: wfDefinitions,
      })
      .from(wfInstances)
      .innerJoin(wfDefinitions, eq(wfInstances.definitionId, wfDefinitions.id))
      .where(
        and(
          eq(wfInstances.status, 'in_progress'),
          sql`(${wfInstances.initiatedBy} = ${userId} OR EXISTS (
            SELECT 1
            FROM jsonb_array_elements(${wfDefinitions.steps}) AS s
            WHERE (s->>'step')::int = ${wfInstances.currentStep}
            AND   (s->>'role_id')::int = ANY(ARRAY[${sql.join(
              roleIds.length > 0 ? roleIds.map((id) => sql`${id}::int`) : [sql`0`],
              sql`, `,
            )}]::int[])
          ))`
        ),
      )

    return results
  }

  // ----------------------------------------------------------------
  // Utilities
  // ----------------------------------------------------------------

  async getStatus(id: ID): Promise<WorkflowInstance> {
    return cacheService.getOrSet(
      CacheKey.workflowInstance(id),
      CacheTTL.WORKFLOW_INSTANCE,
      async () => {
        const [row] = await db.select().from(wfInstances).where(eq(wfInstances.id, id))
        if (!row) throw new NotFoundError('Workflow instance')
        return row as unknown as WorkflowInstance
      },
    )
  }

  async getHistory(id: ID) {
    return db
      .select()
      .from(wfStepLogs)
      .where(eq(wfStepLogs.instanceId, id))
      .orderBy(asc(wfStepLogs.actedAt))
  }

  async cancel(id: ID, actorId: ID, reason: string): Promise<void> {
    const [inst] = await db.select().from(wfInstances).where(eq(wfInstances.id, id))
    if (!inst) throw new NotFoundError('Workflow instance')
    if (inst.status !== 'in_progress') {
      throw new ForbiddenError('Chỉ có thể huỷ workflow đang in_progress')
    }

    await db
      .update(wfInstances)
      .set({ status: 'cancelled', completedAt: new Date() })
      .where(eq(wfInstances.id, id))

    // Fix: dùng inst.currentStep thay vì hardcode 0
    await db.insert(wfStepLogs).values({
      instanceId: id,
      stepNumber: inst.currentStep,
      stepName: 'Cancelled',
      actorId,
      action: 'reject',
      comment: reason,
    })

    await cacheService.invalidateWorkflowInstance(id)
  }

  async updateMetadata(instanceId: ID, metadata: any): Promise<void> {
    await db
      .update(wfInstances)
      .set({ metadata })
      .where(eq(wfInstances.id, instanceId))
    await cacheService.invalidateWorkflowInstance(instanceId)
  }
}

export const workflowEngine = new WorkflowEngine()