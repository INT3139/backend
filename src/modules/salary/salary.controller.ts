import { Request, Response } from "express"
import { salaryService } from "./salary.service"
import { success, created } from "@/utils/response"
import { AuthUser } from "@/types"
import { logAction } from "@/core/middlewares/auditContext"
import { asyncHandler, NotFoundError } from "@/core/middlewares/errorHandler"

interface AuthRequest extends Request {
    user?: AuthUser
    userId?: string
}

/**
 * GET /api/v1/salary/me
 * Get thông tin lương của user hiện tại
 */
export const getMySalary = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const salary = await salaryService.getSalaryByUserId(req.user!.id)

    if (!salary) {
        throw new NotFoundError('Salary info not found')
    }

    await logAction(req.userId!, 'read', 'salary', salary.id)

    return success(res, salary)
})

/**
 * GET /api/v1/salary/info/:profileId
 * Get thông tin lương by Profile ID
 */
export const getSalaryByProfileId = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { profileId } = req.params

    const salary = await salaryService.getSalaryByProfileId(profileId as string)

    if (!salary) {
        throw new NotFoundError('Salary info not found')
    }

    await logAction(req.userId!, 'read', 'salary', profileId as string)

    return success(res, salary)
})

/**
 * PUT /api/v1/salary/info/:profileId
 * Update thông tin lương
 */
export const updateSalary = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { profileId } = req.params

    const updated = await salaryService.updateSalary(
        profileId as string,
        req.body,
        req.user!
    )

    await logAction(req.userId!, 'update', 'salary', profileId as string, req.body)

    return success(res, updated)
})

/**
 * GET /api/v1/salary/proposals
 * Get danh sách đề xuất nâng lương
 */
export const getProposals = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const {
        page = 1,
        limit = 20,
        unitId,
        status
    } = req.query

    const filter = {
        unitId: unitId as string | undefined,
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
 * Tạo đề xuất nâng lương
 */
export const createProposal = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const proposal = await salaryService.createProposal(req.body, req.user!.id)

    await logAction(req.userId!, 'create', 'salary_upgrade_proposal', proposal.id, req.body)

    return created(res, proposal)
})

/**
 * POST /api/v1/salary/proposals/:id/approve
 * Duyệt nâng lương
 */
export const approveProposal = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params

    const updated = await salaryService.approveProposal(id as string, req.user!.id)

    await logAction(req.userId!, 'approve', 'salary_upgrade_proposal', id as string)

    return success(res, updated)
})
