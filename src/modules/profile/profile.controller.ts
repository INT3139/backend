import { Request, Response } from "express"
import path from "path"
import fs from "fs"
import { export2CForm, ProfileData } from "@/services/2c.service"
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

    const result = await profileService.getProfiles(filter, pagination, req.userId!)
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
 * Helper function to handle the 2C export logic
 * Syncs data fetching with getMyProfile logic
 */
const handle2CExport = async (profile: any, req: AuthRequest, res: Response) => {
    const userId = profile.userId
    const profileId = profile.id

    // Lấy dữ liệu extra giống hệt getMyProfile
    const [salary, rewards] = await Promise.all([
        salaryService.getSalaryByUserId(userId),
        rewardService.getRewardsByUserId(userId)
    ])

    // Serialize để convert Date -> String ISO (rất quan trọng cho 2c.service)
    const p = JSON.parse(JSON.stringify(profile))
    const s = salary ? JSON.parse(JSON.stringify(salary)) : null
    const r = rewards ? JSON.parse(JSON.stringify(rewards)) : null

    // Map dữ liệu sang ProfileData cho service
    const profileData: ProfileData = {
        user: p.user || { fullName: '', username: '', email: '' },
        gender: p.gender || '',
        dateOfBirth: p.dateOfBirth || '',
        nickName: p.nickName || '',
        ethnicity: p.ethnicity || '',
        religion: p.religion || '',
        idNumber: p.idNumber || '',
        idIssuedDate: p.idIssuedDate || '',
        idIssuedBy: p.idIssuedBy || '',
        maritalStatus: p.maritalStatus || '',
        addrHometown: p.addrHometown || {},
        addrBirthplace: p.addrBirthplace || {},
        addrPermanent: p.addrPermanent || {},
        addrCurrent: p.addrCurrent || {},
        phoneWork: p.phoneWork || '',
        phoneHome: p.phoneHome || '',
        eduLevelGeneral: p.eduLevelGeneral || '',
        politicalTheory: p.politicalTheory || '',
        foreignLangLevel: p.foreignLangLevel || '',
        itLevel: p.itLevel || '',
        academicDegree: p.academicDegree || '',
        joinDate: p.joinDate || '',
        staffType: p.staffType || '',
        education: p.education || [],
        workHistory: p.workHistory || [],
        family: p.family || [],
        salary: s ? {
            occupationTitle: s.occupationTitle || '',
            occupationCode: s.occupationCode || '',
            salaryGrade: s.salaryGrade || 0,
            salaryCoefficient: s.salaryCoefficient || '',
            effectiveDate: s.effectiveDate || ''
        } : null,
        healthRecords: p.healthRecords ? {
            healthStatus: p.healthRecords.healthStatus || '',
            weightKg: p.healthRecords.weightKg?.toString() || '',
            heightCm: p.healthRecords.heightCm?.toString() || '',
            bloodType: p.healthRecords.bloodType || ''
        } : null,
        rewards: r ? {
            commendations: (r.commendations || []).map((c: any) => ({
                awardName: c.awardName,
                decisionDate: c.decisionDate,
                decisionNumber: c.decisionNumber,
                awardLevel: c.awardLevel,
                isHighestAward: c.isHighestAward
            })),
            titles: (r.titles || []).map((t: any) => ({
                titleName: t.titleName,
                awardedYear: t.awardedYear,
                decisionNumber: t.decisionNumber,
                titleLevel: t.titleLevel,
                isHighest: t.isHighest
            })),
            discipline: r.discipline || []
        } : { commendations: [], titles: [], discipline: [] }
    }

    const templatePath = path.join(process.cwd(), "src/public/2C.docx")
    const defaultPhotoPath = path.join(process.cwd(), "src/public/4_6.png")
    
    try {
        let photo: any = undefined
        if (fs.existsSync(defaultPhotoPath)) {
            photo = {
                data: fs.readFileSync(defaultPhotoPath),
                mimeType: 'image/png'
            }
        }

        const docxBuf = await export2CForm({
            templatePath,
            profile: profileData,
            photo
        })

        res.setHeader('Content-Disposition', `attachment; filename="LyLich_2C_${profile.id}.docx"`)
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        res.send(docxBuf)

        await logAction(req.userId!, 'export', 'profile', profile.id.toString())
    } catch (error: any) {
        console.error('Export error:', error)
        res.status(500).json({ success: false, error: { message: 'Failed to generate export document' } })
    }
}

/**
 * GET /api/v1/profile/me/export-2c
 */
export const exportMyProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    // Luôn lấy data mới nhất, không dùng cache để đảm bảo xuất file chính xác
    const profile = await profileService.getProfileByUserId(req.userId!)
    if (!profile) {
        res.status(404).json({ success: false, error: { message: 'Profile not found' } })
        return
    }
    await handle2CExport(profile, req, res)
})

/**
 * GET /api/v1/profile/:id/export
 */
export const exportProfile = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    const { id } = req.params
    const profileId = parseInt(id as string, 10)
    const profile = await profileService.getProfileById(profileId, req.user!)

    if (!profile) {
        res.status(404).json({ success: false, error: { message: 'Profile not found' } })
        return
    }

    await handle2CExport(profile, req, res)
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
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'education',
        parseInt(req.params.subId as string, 10),
        null,
        req.user!,
        'delete'
    )
    return success(res, result)
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
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'family',
        parseInt(req.params.subId as string, 10),
        null,
        req.user!,
        'delete'
    )
    return success(res, result)
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
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'workHistory',
        parseInt(req.params.subId as string, 10),
        null,
        req.user!,
        'delete'
    )
    return success(res, result)
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
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'position',
        parseInt(req.params.subId as string, 10),
        null,
        req.user!,
        'delete'
    )
    return success(res, result)
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
    const result = await profileService.initiateSubUpdateWorkflow(
        parseInt(req.params.id as string, 10),
        'researchWork',
        parseInt(req.params.subId as string, 10),
        null,
        req.user!,
        'delete'
    )
    return success(res, result)
})
