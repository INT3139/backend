import { Request, Response } from "express"
import { workloadService } from "./workload.service"
import { success, created } from "@/utils/response"
import { AuthUser } from "@/types"
import { logAction } from "@/core/middlewares/auditContext"
import { asyncHandler } from "@/core/middlewares/errorHandler"

interface AuthRequest extends Request {
    user?: AuthUser
    userId?: string
}

/**
 * GET /api/v1/workload/me
 */
export const getMyWorkload = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const data = await workloadService.getWorkloadByUserId(req.user!.id)
    await logAction(req.userId!, 'read', 'workload_self')

    return success(res, data)
})

/**
 * POST /api/v1/workload/evidences
 */
export const createEvidence = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const evidence = await workloadService.createEvidence(req.body, req.user!.id)
    await logAction(req.userId!, 'create', 'workload_evidence', evidence.id, req.body)

    return created(res, evidence)
})

/**
 * GET /api/v1/workload/evidences
 */
export const getEvidences = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { page = 1, limit = 20, unitId, academicYear, status } = req.query
    const filter = {
        unitId: unitId as string | undefined,
        academicYear: academicYear as string | undefined,
        status: status as string | undefined
    }
    const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
    }

    const result = await workloadService.getEvidences(filter, pagination, req.user!)
    await logAction(req.userId!, 'read', 'workload_evidence_list', undefined, { filter, pagination })

    return success(res, result)
})

/**
 * POST /api/v1/workload/evidences/:id/approve
 */
export const approveEvidence = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const updated = await workloadService.approveEvidence(id as string, req.user!.id)
    await logAction(req.userId!, 'approve', 'workload_evidence', id as string)

    return success(res, updated)
})

/**
 * POST /api/v1/workload/evidences/:id/reject
 */
export const rejectEvidence = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const { reject_reason } = req.body
    const updated = await workloadService.rejectEvidence(id as string, req.user!.id, reject_reason)
    await logAction(req.userId!, 'reject', 'workload_evidence', id as string, { reject_reason })

    return success(res, updated)
})

/**
 * GET /api/v1/workload/summaries
 */
export const getSummaries = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { page = 1, limit = 20, unitId, academicYear } = req.query
    const filter = {
        unitId: unitId as string | undefined,
        academicYear: academicYear as string | undefined
    }
    const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
    }

    const result = await workloadService.getSummaries(filter, pagination, req.user!)
    await logAction(req.userId!, 'read', 'workload_summary_list', undefined, { filter, pagination })

    return success(res, result)
})
