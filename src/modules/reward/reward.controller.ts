import { Request, Response } from "express"
import { rewardService } from "./reward.service"
import { success, created } from "@/utils/response"
import { AuthUser } from "@/types"
import { logAction } from "@/core/middlewares/auditContext"
import { asyncHandler } from "@/core/middlewares/errorHandler"

interface AuthRequest extends Request {
    user?: AuthUser
    userId?: string
}

/**
 * GET /api/v1/reward/me
 */
export const getMyRewards = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const rewards = await rewardService.getRewardsByUserId(req.user!.id)
    await logAction(req.userId!, 'read', 'reward_self')

    return success(res, rewards)
})

/**
 * GET /api/v1/reward/commendations
 */
export const getCommendations = asyncHandler(async (
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

    const result = await rewardService.getCommendations(filter, pagination, req.user!)
    await logAction(req.userId!, 'read', 'reward_commendation_list', undefined, { filter, pagination })

    return success(res, result)
})

/**
 * POST /api/v1/reward/commendations
 */
export const createCommendation = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const reward = await rewardService.createCommendation(req.body)
    await logAction(req.userId!, 'create', 'reward_commendation', reward.id, req.body)

    return created(res, reward)
})

/**
 * PUT /api/v1/reward/commendations/:id
 */
export const updateCommendation = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const updated = await rewardService.updateCommendation(id as string, req.body)
    await logAction(req.userId!, 'update', 'reward_commendation', id as string, req.body)

    return success(res, updated)
})

/**
 * DELETE /api/v1/reward/commendations/:id
 */
export const deleteCommendation = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    await rewardService.deleteCommendation(id as string)
    await logAction(req.userId!, 'delete', 'reward_commendation', id as string)

    return success(res, { message: 'Commendation deleted' })
})

/**
 * GET /api/v1/reward/titles
 */
export const getTitles = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { page = 1, limit = 20, unitId, awardedYear } = req.query
    const filter = {
        unitId: unitId as string | undefined,
        awardedYear: awardedYear as string | undefined
    }
    const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
    }

    const result = await rewardService.getTitles(filter, pagination, req.user!)
    await logAction(req.userId!, 'read', 'reward_title_list', undefined, { filter, pagination })

    return success(res, result)
})

/**
 * POST /api/v1/reward/titles
 */
export const createTitle = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const title = await rewardService.createTitle(req.body)
    await logAction(req.userId!, 'create', 'reward_title', title.id as string, req.body)

    return created(res, title)
})

/**
 * PUT /api/v1/reward/titles/:id
 */
export const updateTitle = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const updated = await rewardService.updateTitle(id as string, req.body)
    await logAction(req.userId!, 'update', 'reward_title', id as string, req.body)

    return success(res, updated)
})

/**
 * DELETE /api/v1/reward/titles/:id
 */
export const deleteTitle = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    await rewardService.deleteTitle(id as string)
    await logAction(req.userId!, 'delete', 'reward_title', id as string)

    return success(res, { message: 'Title deleted' })
})

/**
 * GET /api/v1/reward/discipline
 */
export const getDisciplinaryRecords = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { page = 1, limit = 20, unitId } = req.query
    const filter = {
        unitId: unitId as string | undefined
    }
    const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
    }

    const result = await rewardService.getDisciplinaryRecords(filter, pagination, req.user!)
    await logAction(req.userId!, 'read', 'reward_discipline_list', undefined, { filter, pagination })

    return success(res, result)
})

/**
 * POST /api/v1/reward/discipline
 */
export const createDiscipline = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const discipline = await rewardService.createDiscipline({ ...req.body, issued_by: req.userId })
    await logAction(req.userId!, 'create', 'reward_discipline', discipline.id as string, req.body)

    return created(res, discipline)
})

/**
 * PUT /api/v1/reward/discipline/:id
 */
export const updateDiscipline = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const updated = await rewardService.updateDiscipline(id as string, req.body)
    await logAction(req.userId!, 'update', 'reward_discipline', id as string, req.body)

    return success(res, updated)
})

/**
 * DELETE /api/v1/reward/discipline/:id
 */
export const deleteDiscipline = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    await rewardService.deleteDiscipline(id as string)
    await logAction(req.userId!, 'delete', 'reward_discipline', id as string)

    return success(res, { message: 'Disciplinary record deleted' })
})
