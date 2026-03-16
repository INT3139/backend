import { db } from "@/configs/db";
import { wfInstances, wfStepLogs, wfDefinitions } from "@/db/schema/workflow";
import { eq, and, asc, inArray, or, sql } from "drizzle-orm";
import { cacheService } from "../cache/cache.service";
import { CacheKey, CacheTTL } from "../cache/cacheKey";
import { ID, WorkflowStatus, WorkflowInitPayload } from "@/types";
import { NotFoundError, ForbiddenError } from "../middlewares/errorHandler";
import { adminRepo } from "@/modules/admin/admin.repo";
import { permissionService } from "../permissions/permission.service";

export interface WorkflowInstance {
  id: ID;
  definitionId: ID;
  resourceType: string;
  resourceId: ID
  status: WorkflowStatus;
  currentStep: number;
  metadata: any;
  startedAt: Date;
  completedAt?: Date | null
}

export class WorkflowEngine {
  async getDefinition(code: string) {
    return cacheService.getOrSet(CacheKey.workflowDefinition(code), CacheTTL.WORKFLOW_DEF, async () => {
      const rows = await db.select()
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
      status: 'pending', // Mặc định là pending cho đến khi có bước đầu tiên được thực hiện
      currentStep: 1,
      metadata: p.metadata ?? {},
      dueAt: p.dueAt ?? null
    }).returning()
    const inst = rows[0]
    
    // Bước 1 thường là bước khởi tạo, ta coi như đã hoàn thành bởi người initiate
    await db.update(wfInstances).set({ status: 'in_progress' }).where(eq(wfInstances.id, inst.id))

    await db.insert(wfStepLogs).values({
      instanceId: inst.id,
      stepNumber: 1,
      stepName: (def.steps as any)?.[0]?.name ?? 'Khởi tạo',
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

      const defRows = await tx.select().from(wfDefinitions).where(eq(wfDefinitions.id, inst.definitionId))
      const def = defRows[0]
      if (!def) throw new NotFoundError('Workflow definition')

      // VALIDATE ROLE/PERMISSION FOR CURRENT STEP
      const steps = def.steps as any[]
      const currentStepDef = steps.find(s => s.stepNumber === inst.currentStep)
      if (currentStepDef) {
        let hasAccess = false
        if (currentStepDef.requiredRole) {
          const userRoles = await adminRepo.getRolesForUser(actorId)
          if (userRoles.includes(currentStepDef.requiredRole)) hasAccess = true
        }
        if (currentStepDef.requiredPermission) {
          if (await permissionService.hasPermission(actorId, currentStepDef.requiredPermission)) hasAccess = true
        }
        // Nếu không quy định role/perm thì ai cũng advance được (tạm thời)
        if (!currentStepDef.requiredRole && !currentStepDef.requiredPermission) hasAccess = true

        if (!hasAccess) {
          throw new ForbiddenError('Bạn không có quyền thực hiện bước này của quy trình')
        }
      }

      const nextStep = inst.currentStep + 1
      const isLast = nextStep > steps.length
      const newStatus: WorkflowStatus = action === 'reject' ? 'rejected' : (isLast ? 'approved' : 'in_progress')

      await tx.update(wfInstances).set({
        currentStep: isLast || action === 'reject' ? inst.currentStep : nextStep,
        status: newStatus,
        completedAt: newStatus !== 'in_progress' ? new Date() : null
      }).where(eq(wfInstances.id, inst.id))

      await tx.insert(wfStepLogs).values({
        instanceId: inst.id,
        stepNumber: inst.currentStep,
        stepName: currentStepDef?.name ?? `Step ${inst.currentStep}`,
        actorId,
        action,
        comment: comment ?? null
      })

      await cacheService.invalidateWorkflowInstance(inst.id)
      return { ...inst, status: newStatus, currentStep: isLast || action === 'reject' ? inst.currentStep : nextStep } as unknown as WorkflowInstance
    })
  }

  /**
   * Lấy danh sách task (workflow instances) đang chờ xử lý của user hiện tại
   */
  async getMyTasks(userId: ID) {
    const userRoles = await adminRepo.getRolesForUser(userId)
    
    // Tìm các workflow instance mà bước hiện tại yêu cầu role của user
    // Vì steps là JSONB, ta dùng sql để filter (PostgreSQL)
    // Giả sử cấu hình step là: { stepNumber: 1, requiredRole: 'hrm_director' }
    
    const results = await db.select({
      instance: wfInstances,
      definition: wfDefinitions
    })
    .from(wfInstances)
    .innerJoin(wfDefinitions, eq(wfInstances.definitionId, wfDefinitions.id))
    .where(and(
      eq(wfInstances.status, 'in_progress'),
      sql`EXISTS (
        SELECT 1 FROM jsonb_array_elements(${wfDefinitions.steps}) AS s
        WHERE (s->>'stepNumber')::int = ${wfInstances.currentStep}
        AND (
          s->>'requiredRole' IN ${userRoles.length > 0 ? sql`(${sql.join(userRoles.map(r => sql.raw(`'${r}'`)), sql`, `)})` : sql`('')`}
          OR s->>'requiredRole' IS NULL
        )
      )`
    ))
    
    return results
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

  /**
   * Cập nhật dữ liệu tạm thời (metadata) trong quy trình.
   * Dùng khi Admin muốn sửa lại thông tin user đã gửi trước khi bấm Duyệt.
   */
  async updateMetadata(instanceId: ID, metadata: any): Promise<void> {
    await db.update(wfInstances)
      .set({ metadata })
      .where(eq(wfInstances.id, instanceId));
    
    await cacheService.invalidateWorkflowInstance(instanceId);
  }
}

export const workflowEngine = new WorkflowEngine()
