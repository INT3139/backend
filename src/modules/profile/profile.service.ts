import { profileRepo, ProfileFilter, ProfileRow, ProfileListRow } from "./profile.repo"
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
    positions?: any[]
    researchWorks?: any[]
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
    lastUpdatedBy?: ID
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
        userId: ID
    ) {
        const scopes = await permissionService.getScopes(userId)
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
            const [education, family, workHistory, extraInfo, healthRecords, positions, researchWorks] = await Promise.all([
                profileSubRepo.getEducation(id),
                profileSubRepo.getFamily(id),
                profileSubRepo.getWorkHistory(id),
                profileSubRepo.getExtraInfo(id),
                profileSubRepo.getHealthRecords(id),
                profileSubRepo.getPositions(id),
                profileSubRepo.getResearchWorks(id)
            ])

            profile.education = education
            profile.family = family
            profile.workHistory = workHistory
            profile.extraInfo = extraInfo
            profile.healthRecords = healthRecords
            profile.positions = positions
            profile.researchWorks = researchWorks

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

        // Atomically set to 'pending' — prevents race conditions and double submission
        const locked = await profileRepo.setPendingAtomically(id)
        if (!locked) {
            throw new ForbiddenError('Hồ sơ đang trong quá trình chờ duyệt, không thể chỉnh sửa thêm.')
        }

        // Tạo workflow, lưu data thay đổi vào metadata kèm theo type
        const workflow = await workflowEngine.initiate({
            definitionCode: WF.PROFILE_UPDATE,
            resourceType: 'profile',
            resourceId: id,
            initiatedBy: user.id,
            metadata: {
                type: 'main',
                data: data
            }
        })

        return {
            message: 'Yêu cầu cập nhật hồ sơ đã được gửi và đang chờ phê duyệt.',
            workflowId: workflow.id
        }
    }

    /**
     * Khởi tạo workflow cập nhật/xóa cho các phần con (education, family, ...)
     */
    async initiateSubUpdateWorkflow(
        profileId: ID,
        type: 'education' | 'family' | 'workHistory' | 'extraInfo' | 'healthRecords' | 'position' | 'researchWork',
        subId: ID | undefined,
        data: any,
        user: AuthUser,
        action: 'upsert' | 'delete' = 'upsert'
    ) {
        const existing = await profileRepo.findById(profileId)
        if (!existing) throw new NotFoundError('Profile not found')

        // Atomically set to 'pending' — prevents race conditions and double submission
        const locked = await profileRepo.setPendingAtomically(profileId)
        if (!locked) {
            throw new ForbiddenError('Hồ sơ đang trong quá trình chờ duyệt, không thể chỉnh sửa thêm.')
        }

        const workflow = await workflowEngine.initiate({
            definitionCode: WF.PROFILE_UPDATE,
            resourceType: 'profile',
            resourceId: profileId,
            initiatedBy: user.id,
            metadata: {
                type,
                subId,
                data,
                action
            }
        })

        return {
            message: `Yêu cầu ${action === 'delete' ? 'xóa' : 'cập nhật'} ${type} đã được gửi và đang chờ phê duyệt.`,
            workflowId: workflow.id
        }
    }

    /**
     * Xử lý khi Workflow bị từ chối
     */
    async handleRejectionFromWorkflow(workflowId: ID, rejectedBy: ID): Promise<void> {
        const inst = await workflowEngine.getStatus(workflowId)
        const profileId = inst.resourceId
        
        // Nếu bị từ chối, ta chuyển profile về 'approved' (coi như vẫn dùng dữ liệu cũ)
        // hoặc 'draft' tùy theo quy trình của bạn. Ở đây ta chuyển về 'approved' để profile vẫn active.
        await profileRepo.update(profileId, {
            profileStatus: 'approved',
            lastUpdatedBy: rejectedBy
        })

        await rDel(CacheKey.profileFull(profileId))
    }

    /**
     * Hàm tổng hợp để xử lý một bước trong workflow và tự động apply thay đổi nếu là bước cuối
     */
    async completeWorkflowTask(instanceId: ID, actorId: ID, action: 'approve' | 'reject' | 'request_revision' | 'forward', comment?: string): Promise<any> {
        // 1. Tiến hành bước tiếp theo trong workflow engine
        const inst = await workflowEngine.advance(instanceId, actorId, action, comment)

        // 2. Nếu workflow đã hoàn thành (approved), apply data từ metadata vào DB
        if (inst.status === 'approved') {
            return await this.applyChangesFromWorkflow(instanceId, actorId)
        }

        // 3. Nếu workflow bị từ chối (rejected), xử lý revert trạng thái
        if (inst.status === 'rejected') {
            await this.handleRejectionFromWorkflow(instanceId, actorId)
            return { message: 'Yêu cầu đã bị từ chối và hồ sơ đã được trả về trạng thái cũ.' }
        }

        return { message: 'Bước quy trình đã được thực hiện thành công.', status: inst.status }
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
    async applyChangesFromWorkflow(workflowId: ID, approvedBy: ID): Promise<any> {
        const inst = await workflowEngine.getStatus(workflowId)
        if (inst.status !== 'approved') {
            throw new ForbiddenError('Workflow must be approved first')
        }

        const profileId = inst.resourceId
        const { type, subId, data, action } = inst.metadata as any

        let result: any

        if (action === 'delete') {
            switch (type) {
                case 'education':
                    result = await profileSubRepo.deleteEducation(subId)
                    break
                case 'family':
                    result = await profileSubRepo.deleteFamily(subId)
                    break
                case 'workHistory':
                    result = await profileSubRepo.deleteWorkHistory(subId)
                    break
                case 'position':
                    result = await profileSubRepo.deletePosition(subId)
                    break
                case 'researchWork':
                    result = await profileSubRepo.deleteResearchWork(subId)
                    break
            }
        } else {
            switch (type) {
                case 'main':
                    result = await profileRepo.update(profileId, {
                        ...data,
                        profileStatus: 'approved',
                        lastUpdatedBy: approvedBy
                    })
                    break
                case 'education':
                    result = subId
                        ? await profileSubRepo.updateEducation(subId, data)
                        : await profileSubRepo.createEducation({ ...data, profileId })
                    break
                case 'family':
                    result = subId
                        ? await profileSubRepo.updateFamily(subId, data)
                        : await profileSubRepo.createFamily({ ...data, profileId })
                    break
                case 'workHistory':
                    result = subId
                        ? await profileSubRepo.updateWorkHistory(subId, data)
                        : await profileSubRepo.createWorkHistory({ ...data, profileId })
                    break
                case 'extraInfo':
                    result = await profileSubRepo.upsertExtraInfo(profileId, data)
                    break
                case 'healthRecords':
                    result = await profileSubRepo.upsertHealthRecords(profileId, data)
                    break
                case 'position':
                    result = subId
                        ? await profileSubRepo.updatePosition(subId, data)
                        : await profileSubRepo.createPosition({ ...data, profileId })
                    break
                case 'researchWork':
                    result = subId
                        ? await profileSubRepo.updateResearchWork(subId, data)
                        : await profileSubRepo.createResearchWork({ ...data, profileId })
                    break
                default:
                    // Fallback for legacy metadata (no type field)
                    result = await profileRepo.update(profileId, {
                        ...inst.metadata,
                        profileStatus: 'approved',
                        lastUpdatedBy: approvedBy
                    })
            }
        }

        // For non-main updates, set the parent profile back to 'approved'
        if (type !== 'main') {
            await profileRepo.update(profileId, { profileStatus: 'approved', updatedAt: new Date() })
        }

        await rDel(CacheKey.profileFull(profileId))
        return result
    }

    /**
     * Approve profile (initial draft → approved only).
     * Profiles with pending workflow changes must go through processTask instead.
     */
    async approveProfile(id: ID, approvedBy: ID): Promise<ProfileRow> {
        const existing = await profileRepo.findById(id)
        if (!existing) {
            throw new NotFoundError('Profile not found')
        }

        if (existing.profileStatus === 'pending') {
            throw new ForbiddenError('Hồ sơ đang chờ duyệt qua quy trình. Hãy dùng processTask để phê duyệt.')
        }

        const updated = await profileRepo.update(id, {
            profileStatus: 'approved',
            lastUpdatedBy: approvedBy
        })

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
