import { Request, Response } from "express"
import { recruitmentService } from "./recruitment.service"
import { success, created } from "@/utils/response"
import { AuthUser, ID } from "@/types"
import { logAction } from "@/core/middlewares/auditContext"
import { asyncHandler, NotFoundError } from "@/core/middlewares/errorHandler"

interface AuthRequest extends Request {
    user?: AuthUser
    userId?: ID
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
        sort = 'createdAt',
        order = 'desc',
        unitId,
        status,
        keyword
    } = req.query

    const filter = {
        unitId: unitId ? parseInt(unitId as string, 10) : undefined,
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
 * @param {integer} id.path.required - ID of the proposal
 */
export const getProposalById = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)

    const proposal = await recruitmentService.getProposalById(id)

    if (!proposal) {
        throw new NotFoundError('Proposal not found')
    }

    await logAction(req.userId!, 'read', 'recruitment_proposal', id.toString())

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

    await logAction(req.userId!, 'create', 'recruitment_proposal', proposal.id.toString(), req.body)

    return created(res, proposal)
})

/**
 * PUT /api/v1/recruitment/proposals/:id
 * Update đề xuất
 * @param {integer} id.path.required - ID of the proposal
 */
export const updateProposal = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)

    const updated = await recruitmentService.updateProposal(
        id,
        req.body,
        req.user!
    )

    await logAction(req.userId!, 'update', 'recruitment_proposal', id.toString(), req.body)

    return success(res, updated)
})

/**
 * POST /api/v1/recruitment/proposals/:id/approve
 * Approve đề xuất
 * @param {integer} id.path.required - ID of the proposal
 */
export const approveProposal = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)

    const updated = await recruitmentService.approveProposal(id, req.user!.id)

    await logAction(req.userId!, 'approve', 'recruitment_proposal', id.toString())

    return success(res, updated)
})

// --- CANDIDATE CONTROLLERS ---

/**
 * GET /api/v1/recruitment/proposals/:id/candidates
 * @param {integer} id.path.required - ID of the proposal
 */
export const getCandidates = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)
    const { page = 1, limit = 20 } = req.query

    const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
    }

    const result = await recruitmentService.getCandidates(id, pagination, req.user!)

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

    await logAction(req.userId!, 'create', 'recruitment_candidate', candidate.id.toString(), req.body)

    return created(res, candidate)
})

/**
 * PUT /api/v1/recruitment/candidates/:id
 * @param {integer} id.path.required - ID of the candidate
 */
export const updateCandidate = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)

    const updated = await recruitmentService.updateCandidate(id, req.body, req.user!)

    await logAction(req.userId!, 'update', 'recruitment_candidate', id.toString(), req.body)

    return success(res, updated)
})

/**
 * DELETE /api/v1/recruitment/candidates/:id
 * @param {integer} id.path.required - ID of the candidate
 */
export const deleteCandidate = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)

    await recruitmentService.deleteCandidate(id, req.user!)

    await logAction(req.userId!, 'delete', 'recruitment_candidate', id.toString())

    return success(res, { message: 'Candidate deleted' })
})
