import { Request, Response } from "express"
import { profileService } from "./profile.service"
import { profileSubRepo } from "./profileSub.repo"
import { success, created } from "@/utils/response"
import { AuthUser, ID } from "@/types"
import { logAction } from "@/core/middlewares/auditContext"
import { asyncHandler } from "@/core/middlewares/errorHandler"
import { exportService } from "@/services/export.service"
import { storageService } from "@/services/storage.service"
import { workflowEngine } from "@/core/workflow/engine"
import { rewardService } from "../reward/reward.service"
import { salaryService } from "../salary/salary.service"
import { recruitmentService } from "../recruitment/recruitment.service"
import { permissionService } from "@/core/permissions/permission.service"
import { PERM } from "@/constants/permission"

interface AuthRequest extends Request {
    user?: AuthUser
    userId?: ID
}

/**
 * GET /api/v1/profile/me
 */
export const getMyProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const userId = req.userId!
    const profile = await profileService.getProfileByUserId(userId)
    
    if (profile) {
        const [hasRewardPerm, hasSalaryPerm, hasRecruitmentPerm] = await Promise.all([
            permissionService.hasPermission(userId, PERM.REWARD.SELF_READ),
            permissionService.hasPermission(userId, PERM.SALARY.SELF_READ),
            permissionService.hasPermission(userId, PERM.RECRUITMENT.SELF_READ)
        ])

        const extraData = await Promise.all([
            hasRewardPerm ? rewardService.getRewardsByUserId(userId) : Promise.resolve(null),
            hasSalaryPerm ? salaryService.getSalaryByUserId(userId) : Promise.resolve(null),
            hasRecruitmentPerm ? recruitmentService.getRecruitmentData(profile.id) : Promise.resolve(null)
        ])

        Object.assign(profile, {
            rewards: extraData[0],
            salary: extraData[1],
            recruitment: extraData[2]
        })
    }

    await logAction(userId, 'read', 'profile_self', profile?.id.toString())

    return success(res, profile)
})

/**
 * GET /api/v1/profile
 */
export const getProfiles = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { page = 1, limit = 20, unitId, staffType, employmentStatus, keyword, profileStatus } = req.query
    const filter = {
        unitId: unitId ? parseInt(unitId as string, 10) : undefined,
        staffType: staffType as string | undefined,
        employmentStatus: employmentStatus as string | undefined,
        keyword: keyword as string | undefined,
        profileStatus: profileStatus as string | undefined
    }
    const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
    }

    const result = await profileService.getProfiles(filter, pagination, req.user!)
    await logAction(req.userId!, 'read', 'profile_list', undefined, { filter, pagination })

    return success(res, result)
})

/**
 * GET /api/v1/profile/search
 */
export const searchProfiles = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { q, limit = 10 } = req.query
    const result = await profileService.searchProfiles(q as string, parseInt(limit as string, 10))
    return success(res, result)
})

/**
 * GET /api/v1/profile/:id
 */
export const getProfileById = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const profile = await profileService.getProfileById(parseInt(id as string, 10), req.user!)
    await logAction(req.userId!, 'read', 'profile', id as string)

    return success(res, profile)
})

/**
 * POST /api/v1/profile
 */
export const createProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const profile = await profileService.createProfile({ ...req.body, createdBy: req.userId! })
    await logAction(req.userId!, 'create', 'profile', profile.id.toString(), req.body)

    return created(res, profile)
})

/**
 * PUT /api/v1/profile/:id
 */
export const updateProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const updated = await profileService.updateProfile(parseInt(id as string, 10), req.body, req.user!)
    await logAction(req.userId!, 'update', 'profile', id as string, req.body)

    return success(res, updated)
})

/**
 * GET /api/v1/profile/:id/export
 */
export const exportProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const profileId = parseInt(id as string, 10)
    const profile = await profileService.getProfileById(profileId, req.user!)

    if (!profile) {
        return res.status(404).json({ message: 'Profile not found' })
    }

    // 1. Generate CV buffer từ template
    const cvBuffer = await exportService.exportCurriculumVitae(profile)

    // 2. Upload lên S3 theo cấu trúc [userId]/[profileId]/2C.docx
    const customPath = `${profile.userId}/${profileId}`
    const attachment = await storageService.upload({
        buffer: cvBuffer,
        originalName: '2C.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        resourceType: 'profile',
        resourceId: profileId,
        uploadedBy: req.userId!,
        category: 'cv',
        customPath: customPath
    })

    // 3. Lấy presigned URL để tải xuống
    const downloadUrl = await storageService.getDownloadUrl(attachment.id, req.userId!)

    await logAction(req.userId!, 'export', 'profile', id as string)

    return success(res, { downloadUrl })
})

/**
 * DELETE /api/v1/profile/:id
 */
export const deleteProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    await profileService.deleteProfile(parseInt(id as string, 10), req.user!)
    await logAction(req.userId!, 'delete', 'profile', id as string)

    return success(res, { message: 'Profile deleted' })
})

/**
 * POST /api/v1/profile/:id/approve
 */
export const approveProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const updated = await profileService.approveProfile(parseInt(id as string, 10), req.userId!)
    await logAction(req.userId!, 'approve', 'profile', id as string)
    return success(res, updated)
})

/**
 * POST /api/v1/profile/:id/reject
 */
export const rejectProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const updated = await profileService.rejectProfile(parseInt(id as string, 10), req.userId!)
    await logAction(req.userId!, 'reject', 'profile', id as string)
    return success(res, updated)
})

/**
 * PUT /api/v1/profile/:id/status
 */
export const changeStatus = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const { status } = req.body
    const updated = await profileService.changeStatus(parseInt(id as string, 10), status, req.user!)
    await logAction(req.userId!, 'update_status', 'profile', id as string, { status })
    return success(res, updated)
})

export const getMyTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await workflowEngine.getMyTasks(req.userId!)
    return success(res, result)
})

export const processTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { instanceId } = req.params
    const { action, comment } = req.body
    const result = await profileService.completeWorkflowTask(
        parseInt(instanceId as string, 10),
        req.userId!,
        action,
        comment
    )
    return success(res, result)
})

// --- SUB SECTIONS ---

export const getEducation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileSubRepo.getEducation(parseInt(req.params.id as string, 10))
    return success(res, result)
})

export const createEducation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'education',
        undefined,
        req.body,
        req.user!
    )
    return success(res, result)
})

export const updateEducation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'education',
        parseInt(req.params.subId as string, 10),
        req.body,
        req.user!
    )
    return success(res, result)
})

export const deleteEducation = asyncHandler(async (req: AuthRequest, res: Response) => {
    await profileSubRepo.deleteEducation(parseInt(req.params.subId as string, 10))
    return success(res, { message: 'Deleted' })
})

export const getFamily = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileSubRepo.getFamily(parseInt(req.params.id as string, 10))
    return success(res, result)
})

export const createFamily = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'family',
        undefined,
        req.body,
        req.user!
    )
    return success(res, result)
})

export const updateFamily = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'family',
        parseInt(req.params.subId as string, 10),
        req.body,
        req.user!
    )
    return success(res, result)
})

export const deleteFamily = asyncHandler(async (req: AuthRequest, res: Response) => {
    await profileSubRepo.deleteFamily(parseInt(req.params.subId as string, 10))
    return success(res, { message: 'Deleted' })
})

export const getWorkHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileSubRepo.getWorkHistory(parseInt(req.params.id as string, 10))
    return success(res, result)
})

export const createWorkHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'workHistory',
        undefined,
        req.body,
        req.user!
    )
    return success(res, result)
})

export const updateWorkHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'workHistory',
        parseInt(req.params.subId as string, 10),
        req.body,
        req.user!
    )
    return success(res, result)
})

export const deleteWorkHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    await profileSubRepo.deleteWorkHistory(parseInt(req.params.subId as string, 10))
    return success(res, { message: 'Deleted' })
})

export const getExtraInfo = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileSubRepo.getExtraInfo(parseInt(req.params.id as string, 10))
    return success(res, result)
})

export const updateExtraInfo = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'extraInfo',
        undefined,
        req.body,
        req.user!
    )
    return success(res, result)
})

export const getHealthRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileSubRepo.getHealthRecords(parseInt(req.params.id as string, 10))
    return success(res, result)
})

export const updateHealthRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'healthRecords',
        undefined,
        req.body,
        req.user!
    )
    return success(res, result)
})

// --- POSITIONS ---
export const getPositions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileSubRepo.getPositions(parseInt(req.params.id as string, 10))
    return success(res, result)
})

export const createPosition = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'position',
        undefined,
        req.body,
        req.user!
    )
    return success(res, result)
})

export const updatePosition = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'position',
        parseInt(req.params.subId as string, 10),
        req.body,
        req.user!
    )
    return success(res, result)
})

export const deletePosition = asyncHandler(async (req: AuthRequest, res: Response) => {
    await profileSubRepo.deletePosition(parseInt(req.params.subId as string, 10))
    return success(res, { message: 'Deleted' })
})

// --- RESEARCH WORKS ---
export const getResearchWorks = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileSubRepo.getResearchWorks(parseInt(req.params.id as string, 10))
    return success(res, result)
})

export const createResearchWork = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'researchWork',
        undefined,
        req.body,
        req.user!
    )
    return success(res, result)
})

export const updateResearchWork = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'researchWork',
        parseInt(req.params.subId as string, 10),
        req.body,
        req.user!
    )
    return success(res, result)
})

export const deleteResearchWork = asyncHandler(async (req: AuthRequest, res: Response) => {
    await profileSubRepo.deleteResearchWork(parseInt(req.params.subId as string, 10))
    return success(res, { message: 'Deleted' })
})
