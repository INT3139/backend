import { Request, Response } from "express"
import { profileService } from "./profile.service"
import { success, created } from "@/utils/response"
import { AuthUser } from "@/types"
import { logAction } from "@/core/middlewares/auditContext"
import { asyncHandler, NotFoundError } from "@/core/middlewares/errorHandler"

interface AuthRequest extends Request {
    user?: AuthUser
    userId?: string
}

/**
 * GET /api/v1/profiles
 * Get danh sách profiles với filter và pagination
 */
export const getProfiles = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const {
        page = 1,
        limit = 20,
        sort = 'created_at',
        order = 'desc',
        unitId,
        staffType,
        employmentStatus,
        profileStatus,
        keyword
    } = req.query

    const filter = {
        unitId: unitId as string | undefined,
        staffType: staffType as string | undefined,
        employmentStatus: employmentStatus as string | undefined,
        profileStatus: profileStatus as string | undefined,
        keyword: keyword as string | undefined
    }

    const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sort: sort as string,
        order: order as 'asc' | 'desc'
    }

    const result = await profileService.getProfiles(
        filter,
        pagination,
        req.user!
    )

    await logAction(req.userId!, 'read', 'profile', undefined, { filter, pagination })

    return success(res, result)
})

/**
 * GET /api/v1/profiles/me
 * Get profile của user hiện tại
 */
export const getMyProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const profile = await profileService.getMyProfile(req.user!.id)

    if (!profile) {
        throw new NotFoundError('Profile not found')
    }

    await logAction(req.userId!, 'read', 'profile', profile.id)

    return success(res, profile)
})

/**
 * GET /api/v1/profiles/:id
 * Get profile by ID
 */
export const getProfileById = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params

    const profile = await profileService.getProfileById(id as string)

    if (!profile) {
        throw new NotFoundError('Profile not found')
    }

    await logAction(req.userId!, 'read', 'profile', id as string)

    return success(res, profile)
})

/**
 * POST /api/v1/profiles
 * Create profile mới
 */
export const createProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const profile = await profileService.createProfile(req.body, req.user!.id)

    await logAction(req.userId!, 'create', 'profile', profile.id, req.body)

    return created(res, profile)
})

/**
 * PUT /api/v1/profiles/:id
 * Update profile
 */
export const updateProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params

    const updated = await profileService.updateProfile(
        id as string,
        { ...req.body, lastUpdatedBy: req.user!.id },
        req.user!
    )

    await logAction(req.userId!, 'update', 'profile', id as string, req.body)

    return success(res, updated)
})

/**
 * DELETE /api/v1/profiles/:id
 * Soft delete profile
 */
export const deleteProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params

    await profileService.deleteProfile(id as string, req.user!)

    await logAction(req.userId!, 'delete', 'profile', id as string)

    return success(res, { message: 'Profile deleted successfully' })
})

/**
 * GET /api/v1/profiles/search
 * Search profiles by keyword
 */
export const searchProfiles = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { q, limit = 10 } = req.query

    const results = await profileService.searchProfiles(
        q as string,
        parseInt(limit as string, 10)
    )

    await logAction(req.userId!, 'search', 'profile', undefined, { q, limit })

    return success(res, results)
})

/**
 * POST /api/v1/profiles/:id/approve
 * Approve profile
 */
export const approveProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params

    const updated = await profileService.approveProfile(id as string, req.user!.id)

    await logAction(req.userId!, 'approve', 'profile', id as string)

    return success(res, updated)
})

/**
 * POST /api/v1/profiles/:id/reject
 * Reject profile (về draft)
 */
export const rejectProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params

    const updated = await profileService.rejectProfile(id as string, req.user!.id)

    await logAction(req.userId!, 'reject', 'profile', id as string)

    return success(res, updated)
})

/**
 * PATCH /api/v1/profiles/:id/status
 * Change employment status
 */
export const changeStatus = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const { status } = req.body

    const updated = await profileService.changeStatus(id as string, status, req.user!)

    await logAction(req.userId!, 'change_status', 'profile', id as string, { status })

    return success(res, updated)
})

import { educationService } from "./sub/education.service"
import { familyService } from "./sub/family.service"
import { workHistoryService } from "./sub/workHistory.service"
import { extraService } from "./sub/extra.service"
import { healthService } from "./sub/health.service"

// --- EDUCATION ---
export const getEducation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await educationService.getByProfileId(req.params.id as string)
    return success(res, data)
})
export const createEducation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await educationService.create({ ...req.body, profile_id: req.params.id })
    return created(res, data)
})
export const deleteEducation = asyncHandler(async (req: AuthRequest, res: Response) => {
    await educationService.delete(req.params.subId as string)
    return success(res, { message: 'Deleted' })
})

// --- FAMILY ---
export const getFamily = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await familyService.getByProfileId(req.params.id as string)
    return success(res, data)
})
export const createFamily = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await familyService.create({ ...req.body, profile_id: req.params.id })
    return created(res, data)
})
export const deleteFamily = asyncHandler(async (req: AuthRequest, res: Response) => {
    await familyService.delete(req.params.subId as string)
    return success(res, { message: 'Deleted' })
})

// --- WORK HISTORY ---
export const getWorkHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await workHistoryService.getByProfileId(req.params.id as string)
    return success(res, data)
})
export const createWorkHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await workHistoryService.create({ ...req.body, profile_id: req.params.id })
    return created(res, data)
})
export const deleteWorkHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    await workHistoryService.delete(req.params.subId as string)
    return success(res, { message: 'Deleted' })
})

// --- EXTRA & HEALTH ---
export const getExtraInfo = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await extraService.getByProfileId(req.params.id as string)
    return success(res, data)
})
export const updateExtraInfo = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await extraService.update(req.params.id as string, req.body)
    return success(res, data)
})
export const getHealthRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await healthService.getByProfileId(req.params.id as string)
    return success(res, data)
})
export const updateHealthRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await healthService.update(req.params.id as string, req.body)
    return success(res, data)
})


