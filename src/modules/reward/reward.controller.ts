import { Request, Response } from "express"
import { rewardService } from "./reward.service"
import { storageService } from "@/services/storage.service"
import { exportService } from "@/services/export.service"
import { success, created } from "@/utils/response"
import { logAction } from "@/core/middlewares/auditContext"
import { asyncHandler } from "@/core/middlewares/errorHandler"
import { ID } from "@/types"
/**
 * ATTACHMENTS FOR COMMENDATIONS
 */
export const uploadCommendationAttachment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new Error('No file')
    const id = parseInt(req.params.id as string, 10) as ID

    const att = await storageService.upload({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        resourceType: 'reward_commendation',
        resourceId: id,
        uploadedBy: req.userId!
    })

    return created(res, att)
})

export const listCommendationAttachments = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10) as ID
    const result = await storageService.listAttachments('reward_commendation', id)
    return success(res, result)
})

/**
 * ATTACHMENTS FOR TITLES
 */
export const uploadTitleAttachment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new Error('No file')
    const id = parseInt(req.params.id as string, 10) as ID

    const att = await storageService.upload({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        resourceType: 'reward_title',
        resourceId: id,
        uploadedBy: req.userId!
    })

    return created(res, att)
})

export const listTitleAttachments = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10) as ID
    const result = await storageService.listAttachments('reward_title', id)
    return success(res, result)
})

/**
 * ATTACHMENTS FOR DISCIPLINE
 */
export const uploadDisciplineAttachment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new Error('No file')
    const id = parseInt(req.params.id as string, 10) as ID

    const att = await storageService.upload({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        resourceType: 'reward_discipline',
        resourceId: id,
        uploadedBy: req.userId!
    })

    return created(res, att)
})

export const listDisciplineAttachments = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10) as ID
    const result = await storageService.listAttachments('reward_discipline', id)
    return success(res, result)
})

/**
 * GET /api/v1/reward/me
 */
export const getMyRewards = asyncHandler(async (
    req: Request,
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
    req: Request,
    res: Response
): Promise<Response> => {
    const { page = 1, limit = 20, unitId, academicYear } = req.query
    const filter = {
        unitId: unitId ? parseInt(unitId as string, 10) : undefined,
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
    req: Request,
    res: Response
): Promise<Response> => {
    const reward = await rewardService.createCommendation(req.body, req.user!)
    await logAction(req.userId!, 'create', 'reward_commendation', reward.id.toString(), req.body)

    return created(res, reward)
})

/**
 * PUT /api/v1/reward/commendations/:id
 */
export const updateCommendation = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)
    const updated = await rewardService.updateCommendation(id, req.body, req.user!)
    await logAction(req.userId!, 'update', 'reward_commendation', id.toString(), req.body)

    return success(res, updated)
})

/**
 * DELETE /api/v1/reward/commendations/:id
 */
export const deleteCommendation = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)
    await rewardService.deleteCommendation(id, req.user!)
    await logAction(req.userId!, 'delete', 'reward_commendation', id.toString())

    return success(res, { message: 'Commendation deleted' })
})

/**
 * GET /api/v1/reward/titles
 */
export const getTitles = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { page = 1, limit = 20, unitId, awardedYear } = req.query
    const filter = {
        unitId: unitId ? parseInt(unitId as string, 10) : undefined,
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
    req: Request,
    res: Response
): Promise<Response> => {
    const title = await rewardService.createTitle(req.body, req.user!)
    await logAction(req.userId!, 'create', 'reward_title', title.id.toString(), req.body)

    return created(res, title)
})

/**
 * PUT /api/v1/reward/titles/:id
 */
export const updateTitle = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)
    const updated = await rewardService.updateTitle(id, req.body, req.user!)
    await logAction(req.userId!, 'update', 'reward_title', id.toString(), req.body)

    return success(res, updated)
})

/**
 * DELETE /api/v1/reward/titles/:id
 */
export const deleteTitle = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)
    await rewardService.deleteTitle(id, req.user!)
    await logAction(req.userId!, 'delete', 'reward_title', id.toString())

    return success(res, { message: 'Title deleted' })
})

/**
 * GET /api/v1/reward/discipline
 */
export const getDisciplinaryRecords = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { page = 1, limit = 20, unitId } = req.query
    const filter = {
        unitId: unitId ? parseInt(unitId as string, 10) : undefined
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
    req: Request,
    res: Response
): Promise<Response> => {
    const discipline = await rewardService.createDiscipline({ ...req.body, issuedBy: req.userId }, req.user!)
    await logAction(req.userId!, 'create', 'reward_discipline', discipline.id.toString(), req.body)

    return created(res, discipline)
})

/**
 * PUT /api/v1/reward/discipline/:id
 */
export const updateDiscipline = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)
    const updated = await rewardService.updateDiscipline(id, req.body, req.user!)
    await logAction(req.userId!, 'update', 'reward_discipline', id.toString(), req.body)

    return success(res, updated)
})

/**
 * DELETE /api/v1/reward/discipline/:id
 */
export const deleteDiscipline = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)
    await rewardService.deleteDiscipline(id, req.user!)
    await logAction(req.userId!, 'delete', 'reward_discipline', id.toString())

    return success(res, { message: 'Disciplinary record deleted' })
})


/**
 * GET /api/v1/reward/export
 */
export const exportRewards = asyncHandler(async (
    req: Request,
    res: Response
): Promise<void> => {
    const { year, unitId } = req.query
    const buffer = await exportService.exportRewardReport(
        year as string,
        unitId ? parseInt(unitId as string, 10) as ID : undefined
    )
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="rewards-${year ?? 'all'}.xlsx"`)
    res.send(buffer)
})
