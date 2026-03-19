import { exportService } from '@/services/export.service'
import { Request, Response } from "express"
import { salaryService } from "./salary.service"
import { workflowEngine } from "@/core/workflow/engine"
import { success, created } from "@/utils/response"
import { AuthUser, ID } from "@/types"
import { logAction } from "@/core/middlewares/auditContext"
import { asyncHandler } from "@/core/middlewares/errorHandler"

interface AuthRequest extends Request {
    user?: AuthUser
    userId?: ID
}

/**
 * GET /api/v1/salary/me
 */
export const getMySalary = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const salary = await salaryService.getSalaryByUserId(req.user!.id)
    
    await logAction(req.userId!, 'read', 'salary', salary?.id.toString())

    return success(res, salary)
})

/**
 * GET /api/v1/salary/profile/:profileId
 */
export const getSalaryByProfileId = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { profileId } = req.params
    const salary = await salaryService.getSalaryByProfileId(parseInt(profileId as string, 10))
    
    await logAction(req.userId!, 'read', 'salary', profileId as string)

    return success(res, salary)
})

/**
 * PUT /api/v1/salary/profile/:profileId
 */
export const updateSalary = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { profileId } = req.params
    const updated = await salaryService.updateSalary(parseInt(profileId as string, 10), req.body, req.user!)
    
    await logAction(req.userId!, 'update', 'salary', profileId as string, req.body)

    return success(res, updated)
})

/**
 * GET /api/v1/salary/proposals
 */
export const getProposals = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { page = 1, limit = 20, unitId, status } = req.query
    const filter = {
        unitId: unitId ? parseInt(unitId as string, 10) : undefined,
        status: status as string | undefined
    }
    const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
    }

    const result = await salaryService.getProposals(
        filter,
        pagination,
        req.user!
    )

    await logAction(req.userId!, 'read', 'salary_upgrade_proposal', undefined, { filter, pagination })

    return success(res, result)
})

/**
 * POST /api/v1/salary/proposals
 */
export const createProposal = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const result = await salaryService.createProposal(req.body, req.user!)

    await logAction(req.userId!, 'create', 'salary_upgrade_proposal', result.workflowId.toString(), req.body)

    return created(res, result)
})

/**
 * GET /api/v1/salary/tasks
 */
export const getMyTasks = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const result = await workflowEngine.getMyTasks(req.userId!)
    return success(res, result)
})

/**
 * POST /api/v1/salary/tasks/:instanceId
 */
export const processTask = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { instanceId } = req.params
    const { action, comment } = req.body
    const result = await salaryService.completeWorkflowTask(
        parseInt(instanceId as string, 10),
        req.userId!,
        action,
        comment
    )
    return success(res, result)
})

/**
 * GET /api/v1/salary/export/:profileId
 */
export const exportSalaryHistory = asyncHandler(async (
    req: Request,
    res: Response
): Promise<void> => {
    const profileId = parseInt(req.params.profileId as string, 10) as ID
    const buffer = await exportService.exportSalaryHistory(profileId)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="salary-history-${profileId}.xlsx"`)
    res.send(buffer)
})
