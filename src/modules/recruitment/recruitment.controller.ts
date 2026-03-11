import { Request, Response } from "express"
import { recruitmentService } from "./recruitment.service"
import { success, created } from "@/utils/response"
import { AuthUser } from "@/types"
import { logAction } from "@/core/middlewares/auditContext"
import { asyncHandler, NotFoundError } from "@/core/middlewares/errorHandler"

interface AuthRequest extends Request {
    user?: AuthUser
    userId?: string
}

/**
 * GET /api/v1/recruitment/proposals
 * Get danh sách đề xuất tuyển dụng
 */
export const getProposals = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const {
        page = 1,
        limit = 20,
        sort = 'created_at',
        order = 'desc',
        unitId,
        status,
        keyword
    } = req.query

    const filter = {
        unitId: unitId as string | undefined,
        status: status as string | undefined,
        keyword: keyword as string | undefined
    }

    const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sort: sort as string,
        order: order as 'asc' | 'desc'
    }

    const result = await recruitmentService.getProposals(
        filter,
        pagination,
        req.user!
    )

    await logAction(req.userId!, 'read', 'recruitment_proposal', undefined, { filter, pagination })

    return success(res, result)
})

/**
 * GET /api/v1/recruitment/proposals/:id
 * Get đề xuất by ID
 */
export const getProposalById = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params

    const proposal = await recruitmentService.getProposalById(id as string)

    if (!proposal) {
        throw new NotFoundError('Proposal not found')
    }

    await logAction(req.userId!, 'read', 'recruitment_proposal', id as string)

    return success(res, proposal)
})

/**
 * POST /api/v1/recruitment/proposals
 * Create đề xuất mới
 */
export const createProposal = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const proposal = await recruitmentService.createProposal(req.body, req.user!.id)

    await logAction(req.userId!, 'create', 'recruitment_proposal', proposal.id, req.body)

    return created(res, proposal)
})

/**
 * PUT /api/v1/recruitment/proposals/:id
 * Update đề xuất
 */
export const updateProposal = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params

    const updated = await recruitmentService.updateProposal(
        id as string,
        req.body,
        req.user!
    )

    await logAction(req.userId!, 'update', 'recruitment_proposal', id as string, req.body)

    return success(res, updated)
})

/**
 * POST /api/v1/recruitment/proposals/:id/approve
 * Approve đề xuất
 */
export const approveProposal = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params

    const updated = await recruitmentService.approveProposal(id as string, req.user!.id)

    await logAction(req.userId!, 'approve', 'recruitment_proposal', id as string)

    return success(res, updated)
})

// --- CANDIDATE CONTROLLERS ---

/**
 * GET /api/v1/recruitment/proposals/:id/candidates
 */
export const getCandidates = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const { page = 1, limit = 20 } = req.query

    const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
    }

    const result = await recruitmentService.getCandidates(id as string, pagination, req.user!)

    await logAction(req.userId!, 'read', 'recruitment_candidate', undefined, { proposalId: id, pagination })

    return success(res, result)
})

/**
 * POST /api/v1/recruitment/candidates
 */
export const createCandidate = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const candidate = await recruitmentService.createCandidate(req.body, req.user!)

    await logAction(req.userId!, 'create', 'recruitment_candidate', candidate.id, req.body)

    return created(res, candidate)
})

/**
 * PUT /api/v1/recruitment/candidates/:id
 */
export const updateCandidate = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params

    const updated = await recruitmentService.updateCandidate(id as string, req.body, req.user!)

    await logAction(req.userId!, 'update', 'recruitment_candidate', id as string, req.body)

    return success(res, updated)
})

/**
 * DELETE /api/v1/recruitment/candidates/:id
 */
export const deleteCandidate = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params

    await recruitmentService.deleteCandidate(id as string, req.user!)

    await logAction(req.userId!, 'delete', 'recruitment_candidate', id as string)

    return success(res, { message: 'Candidate deleted' })
})
