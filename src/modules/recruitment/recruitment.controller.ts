import { Request, Response } from "express"
import { recruitmentService } from "./recruitment.service"
import { workflowEngine } from "@/core/workflow/engine"
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
    const result = await recruitmentService.createProposal(req.body, req.user!.id)

    await logAction(req.userId!, 'create', 'recruitment_proposal', result.workflowId.toString(), req.body)

    return created(res, result)
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
 * GET /api/v1/recruitment/tasks
 */
export const getMyTasks = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const result = await workflowEngine.getMyTasks(req.userId!)
    return success(res, result)
})

/**
 * POST /api/v1/recruitment/tasks/:instanceId
 */
export const processTask = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { instanceId } = req.params
    const { action, comment } = req.body
    const result = await recruitmentService.completeWorkflowTask(
        parseInt(instanceId as string, 10),
        req.userId!,
        action,
        comment
    )
    return success(res, result)
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

// --- RECRUITMENT INFO CONTROLLERS ---

/**
 * GET /api/v1/recruitment/me
 * Get recruitment info and contracts of current user
 */
export const getMyRecruitment = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const profile = await recruitmentService.getProfileByUserId(req.userId!)
    if (!profile) {
        throw new NotFoundError('Profile not found')
    }

    const result = await recruitmentService.getRecruitmentData(profile.id)

    await logAction(req.userId!, 'read', 'recruitment_info_self', profile.id.toString())

    return success(res, result)
})

/**
 * GET /api/v1/recruitment/info/:profileId
 * Get recruitment info and contracts by profile ID
 * @param {integer} profileId.path.required - Profile ID
 */
export const getRecruitmentByProfileId = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const profileId = parseInt(req.params.profileId as string, 10)

    const result = await recruitmentService.getRecruitmentData(profileId)

    await logAction(req.userId!, 'read', 'recruitment_info', profileId.toString())

    return success(res, result)
})
