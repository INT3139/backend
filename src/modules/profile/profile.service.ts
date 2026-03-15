import { profileRepo, ProfileFilter, ProfileRow } from "./profile.repo"
import { profileSubRepo } from "./profileSub.repo"
import { ID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { permissionService } from "@/core/permissions/permission.service"
import { CacheKey, CacheTTL } from "@/core/cache/cacheKey"
import { rSetJson, rGetJson, rDel } from "@/configs/redis"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"
import { workflowEngine } from "@/core/workflow/engine"
import { WF } from "@/constants/workflowCodes"

export interface FullProfileRow extends ProfileRow {
    education?: any[]
    family?: any[]
    workHistory?: any[]
    extraInfo?: any
    healthRecords?: any
}

export interface CreateProfileDto {
    userId: ID
    unitId: ID
    emailVnu?: string
    emailPersonal?: string
    phoneWork?: string
    phoneHome?: string
    dateOfBirth?: Date | string
    gender?: string
    idNumber?: string
    idIssuedDate?: Date | string
    idIssuedBy?: string
    nationality?: string
    ethnicity?: string
    religion?: string
    maritalStatus?: string
    policyObject?: string
    nickName?: string
    passportNumber?: string
    passportIssuedAt?: Date | string
    passportIssuedBy?: string
    insuranceNumber?: string
    insuranceJoinedAt?: Date | string
    addrHometown?: Record<string, unknown>
    addrBirthplace?: Record<string, unknown>
    addrPermanent?: Record<string, unknown>
    addrCurrent?: Record<string, unknown>
    academicDegree?: string
    academicTitle?: string
    eduLevelGeneral?: string
    stateManagement?: string
    politicalTheory?: string
    foreignLangLevel?: string
    itLevel?: string
    staffType?: string
    employmentStatus?: string
    joinDate?: Date | string
    retireDate?: Date | string
    profileStatus?: string
}

export interface UpdateProfileDto extends Partial<CreateProfileDto> {
}

export class ProfileService {
    /**
     * Get danh sách profiles với filter
     */
    async getProfiles(
        filter: ProfileFilter,
        pagination: PaginationQuery,
        user: AuthUser
    ) {
        const scopes = await permissionService.getScopes(user.id)
        const unitIds = await abacService.getUnitIds(scopes)

        if (unitIds !== 'all') {
            filter.unitIds = unitIds
        }

        return await profileRepo.findMany(filter, pagination)
    }

    /**
     * Get profile by ID với cache
     */
    async getProfileById(id: ID, _user?: AuthUser): Promise<FullProfileRow | null> {
        const cacheKey = CacheKey.profileFull(id)
        const cached = await rGetJson<FullProfileRow>(cacheKey)
        if (cached) {
            return cached
        }

        const profile = await profileRepo.findById(id) as FullProfileRow
        if (profile) {
            const [education, family, workHistory, extraInfo, healthRecords] = await Promise.all([
                profileSubRepo.getEducation(id),
                profileSubRepo.getFamily(id),
                profileSubRepo.getWorkHistory(id),
                profileSubRepo.getExtraInfo(id),
                profileSubRepo.getHealthRecords(id)
            ])

            profile.education = education
            profile.family = family
            profile.workHistory = workHistory
            profile.extraInfo = extraInfo
            profile.healthRecords = healthRecords

            await rSetJson(cacheKey, profile, CacheTTL.PROFILE_FULL)
        }
        return profile
    }

    /**
     * Get profile của user hiện tại
     */
    async getProfileByUserId(userId: ID): Promise<FullProfileRow | null> {
        const main = await profileRepo.findByUserId(userId)
        if (!main) return null
        return await this.getProfileById(main.id)
    }

    /**
     * Create profile mới
     */
    async createProfile(data: CreateProfileDto & { createdBy: ID }): Promise<ProfileRow> {
        const profile = await profileRepo.create(data)

        await abacService.registerScope({
            resourceType: 'profile',
            resourceId: profile.id,
            ownerId: profile.userId,
            unitId: profile.unitId
        })

        return profile
    }

    /**
     * Update profile: Khởi tạo quy trình phê duyệt (Workflow)
     */
    async updateProfile(
        id: ID,
        data: UpdateProfileDto,
        user: AuthUser
    ): Promise<any> {
        const existing = await profileRepo.findById(id)
        if (!existing) {
            throw new NotFoundError('Profile not found')
        }

        const scopes = await permissionService.getScopes(user.id)
        const canUpdate = await abacService.canAccess(
            user.id,
            scopes,
            'profile',
            id
        )

        const isSelf = existing.userId === user.id

        if (!canUpdate && !isSelf) {
            throw new ForbiddenError('You do not have permission to update this profile')
        }

        // NGĂN CHỈNH SỬA KHI ĐANG CHỜ DUYỆT
        if (existing.profileStatus === 'pending') {
            throw new ForbiddenError('Hồ sơ đang trong quá trình chờ duyệt, không thể chỉnh sửa thêm.')
        }

        // Tạo workflow, lưu data thay đổi vào metadata
        const workflow = await workflowEngine.initiate({
            definitionCode: WF.PROFILE_UPDATE,
            resourceType: 'profile',
            resourceId: id,
            initiatedBy: user.id,
            metadata: data 
        })

        // Chuyển trạng thái hồ sơ về 'pending'
        await profileRepo.update(id, { profileStatus: 'pending' })

        return {
            message: 'Yêu cầu cập nhật hồ sơ đã được gửi và đang chờ phê duyệt.',
            workflowId: workflow.id
        }
    }

    /**
     * Soft delete profile
     */
    async deleteProfile(id: ID, user: AuthUser): Promise<void> {
        const existing = await profileRepo.findById(id)
        if (!existing) {
            throw new NotFoundError('Profile not found')
        }

        const scopes = await permissionService.getScopes(user.id)
        const canDelete = await abacService.canAccess(
            user.id,
            scopes,
            'profile',
            id
        )

        if (!canDelete) {
            throw new ForbiddenError('You do not have permission to delete this profile')
        }

        await profileRepo.delete(id)
        await rDel(CacheKey.profileFull(id))
    }

    /**
     * Search profiles
     */
    async searchProfiles(keyword: string, limit = 10): Promise<ProfileRow[]> {
        return await profileRepo.search(keyword, limit)
    }

    /**
     * Áp dụng thay đổi từ Workflow sau khi được duyệt
     */
    async applyChangesFromWorkflow(workflowId: ID, approvedBy: ID): Promise<ProfileRow> {
        const inst = await workflowEngine.getStatus(workflowId)
        if (inst.status !== 'approved') {
            throw new ForbiddenError('Workflow must be approved first')
        }

        const profileId = inst.resourceId
        const dataToUpdate = (inst as any).metadata

        const updated = await profileRepo.update(profileId, {
            ...dataToUpdate,
            profileStatus: 'approved',
            lastUpdatedBy: approvedBy
        })

        await rDel(CacheKey.profileFull(profileId))
        return updated
    }

    /**
     * Approve profile
     */
    async approveProfile(id: ID, approvedBy: ID): Promise<ProfileRow> {
        const updated = await profileRepo.update(id, {
            profileStatus: 'approved',
            lastUpdatedBy: approvedBy
        })

        if (!updated) {
            throw new NotFoundError('Profile not found')
        }

        await rDel(CacheKey.profileFull(id))
        return updated
    }

    /**
     * Reject profile
     */
    async rejectProfile(id: ID, rejectedBy: ID): Promise<ProfileRow> {
        const updated = await profileRepo.update(id, {
            profileStatus: 'draft',
            lastUpdatedBy: rejectedBy
        })

        if (!updated) {
            throw new NotFoundError('Profile not found')
        }

        await rDel(CacheKey.profileFull(id))
        return updated
    }

    /**
     * Change profile status
     */
    async changeStatus(
        id: ID,
        status: string,
        user: AuthUser
    ): Promise<ProfileRow> {
        const updated = await profileRepo.update(id, {
            employmentStatus: status,
            lastUpdatedBy: user.id
        })

        if (!updated) {
            throw new NotFoundError('Profile not found')
        }

        await rDel(CacheKey.profileFull(id))
        return updated
    }
}

export const profileService = new ProfileService()
