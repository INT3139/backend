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
import { registerWorkflowHandler } from "@/core/workflow/workflow.dispatcher"
import { updateProfileSchema } from "./profile.schema"
import { educationSchema, familySchema, workHistorySchema, extraInfoSchema, healthSchema, positionSchema, researchWorkSchema } from "./profileSub.schema"

export interface FullProfileRow extends ProfileRow {
    education?: any[]
    family?: any[]
    workHistory?: any[]
    extraInfo?: any
    healthRecords?: any
    positions?: any[]
    researchWorks?: any[]
    pendingChanges?: any
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

        // Bổ sung dữ liệu đang chờ duyệt (nếu có)
        if (profile && profile.profileStatus === 'pending') {
            const activeWf = await profileRepo.findActiveWorkflow(id)
            if (activeWf) {
                profile.pendingChanges = activeWf.metadata
            }
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

        const isSelf = existing.userId === user.id
        if (!isSelf) {
            const scopes = await permissionService.getScopes(user.id)
            const canUpdate = await abacService.canAccess(user.id, scopes, 'profile', id)
            if (!canUpdate) {
                throw new ForbiddenError('You do not have permission to update this profile')
            }
        }

        const changeKey = 'main'
        const changeData = { [changeKey]: data }

        // Trước khi tạo mới, kiểm tra xem đã có Workflow nào đang chạy chưa
        const activeWf = await profileRepo.findActiveWorkflow(id)
        if (activeWf) {
            await profileRepo.appendWorkflowMetadata(activeWf.id, changeData)
            // Nếu hồ sơ đang ở 'draft' (do vừa bị Revision), ta chuyển nó về 'pending' lại
            if (existing.profileStatus !== 'pending') {
                await profileRepo.update(id, { profileStatus: 'pending' })
            }
            return { message: 'Thay đổi thông tin chính đã được cập nhật vào danh sách chờ duyệt.', workflowId: activeWf.id }
        }

        // Atomically set to 'pending' — prevents race conditions
        const locked = await profileRepo.setPendingAtomically(id)
        if (!locked) {
            // Trường hợp hy hữu: status vừa nhảy sang pending ngay sau khi check activeWf
            const retryWf = await profileRepo.findActiveWorkflow(id)
            if (retryWf) {
                await profileRepo.appendWorkflowMetadata(retryWf.id, changeData)
                return { message: 'Thay đổi thông tin chính đã được cập nhật vào danh sách chờ duyệt.', workflowId: retryWf.id }
            }
        }

        // Tạo workflow, lưu data thay đổi vào metadata kèm theo type
        const workflow = await workflowEngine.initiate({
            definitionCode: WF.PROFILE_UPDATE,
            resourceType: 'profile',
            resourceId: id,
            initiatedBy: user.id,
            metadata: changeData
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

        // Sử dụng key duy nhất cho từng bản ghi con để tránh ghi đè khi merge JSONB
        const changeKey = `sub_${type}_${subId || 'new_' + Math.random().toString(36).substring(2, 9)}`
        const changeData = {
            [changeKey]: { type, subId, data, action }
        }

        // Kiểm tra Workflow đang hoạt động
        const activeWf = await profileRepo.findActiveWorkflow(profileId)
        if (activeWf) {
            await profileRepo.appendWorkflowMetadata(activeWf.id, changeData)
            if (existing.profileStatus !== 'pending') {
                await profileRepo.update(profileId, { profileStatus: 'pending' })
            }
            return { message: `Yêu cầu thay đổi ${type} đã được thêm vào danh sách chờ duyệt.`, workflowId: activeWf.id }
        }

        const locked = await profileRepo.setPendingAtomically(profileId)
        if (!locked) {
            const retryWf = await profileRepo.findActiveWorkflow(profileId)
            if (retryWf) {
                await profileRepo.appendWorkflowMetadata(retryWf.id, changeData)
                return { message: `Yêu cầu thay đổi ${type} đã được thêm vào danh sách chờ duyệt.`, workflowId: retryWf.id }
            }
        }

        const workflow = await workflowEngine.initiate({
            definitionCode: WF.PROFILE_UPDATE,
            resourceType: 'profile',
            resourceId: profileId,
            initiatedBy: user.id,
            metadata: changeData
        })

        return {
            message: `Yêu cầu thay đổi ${type} đã được gửi và đang chờ phê duyệt.`,
            workflowId: workflow.id
        }
    }

    /**
     * Xử lý khi Workflow bị từ chối
     */
    async handleRejectionFromWorkflow(workflowId: ID, rejectedBy: ID, tx?: any): Promise<void> {
        const inst = await workflowEngine.getStatus(workflowId)
        const profileId = inst.resourceId
        
        // Nếu bị từ chối, ta chuyển profile về 'approved' (coi như vẫn dùng dữ liệu cũ)
        // hoặc 'draft' tùy theo quy trình của bạn. Ở đây ta chuyển về 'approved' để profile vẫn active.
        await profileRepo.update(profileId, {
            profileStatus: 'approved',
            lastUpdatedBy: rejectedBy
        }, tx)

        try { await rDel(CacheKey.profileFull(profileId)) } catch (e) { console.error('Redis cache error:', e) }
    }

    /**
     * Hàm tổng hợp để xử lý một bước trong workflow
     */
    async completeWorkflowTask(instanceId: ID, actorId: ID, action: 'approve' | 'reject' | 'request_revision' | 'forward', comment?: string): Promise<any> {
        const inst = await workflowEngine.advance(instanceId, actorId, action, comment)
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
        try { await rDel(CacheKey.profileFull(id)) } catch (e) { console.error('Redis cache error:', e) }
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
    async applyChangesFromWorkflow(workflowId: ID, approvedBy: ID, tx?: any): Promise<any> {
        const inst = await workflowEngine.getStatus(workflowId)
        if (inst.status !== 'approved') {
            throw new ForbiddenError('Workflow must be approved first')
        }

        const profileId = inst.resourceId
        const metadata = inst.metadata as any
        const results: any = {}

        // Duyệt qua tất cả các thay đổi trong Metadata (Cơ chế Batch/Append)
        for (const [key, item] of Object.entries(metadata)) {
            if (key === 'main') {
                const validData = updateProfileSchema.parse(item)
                results.main = await profileRepo.update(profileId, {
                    ...validData,
                    profileStatus: 'approved',
                    lastUpdatedBy: approvedBy
                }, tx)
            } else if (key.startsWith('sub_')) {
                const { type, subId, data, action } = item as any

                if (action === 'delete') {
                    switch (type) {
                        case 'education': await profileSubRepo.deleteEducation(subId, tx); break;
                        case 'family': await profileSubRepo.deleteFamily(subId, tx); break;
                        case 'workHistory': await profileSubRepo.deleteWorkHistory(subId, tx); break;
                        case 'position': await profileSubRepo.deletePosition(subId, tx); break;
                        case 'researchWork': await profileSubRepo.deleteResearchWork(subId, tx); break;
                    }
                    results[key] = { success: true, action: 'delete' }
                } else {
                    switch (type) {
                        case 'education':
                            const eduData = educationSchema.parse(data);
                            results[key] = subId 
                                ? await profileSubRepo.updateEducation(subId, eduData, tx) 
                                : await profileSubRepo.createEducation({ ...eduData, profileId } as any, tx);
                            break;
                        case 'family':
                            const famData = familySchema.parse(data);
                            results[key] = subId 
                                ? await profileSubRepo.updateFamily(subId, { ...famData, status: 'approved' } as any, tx) 
                                : await profileSubRepo.createFamily({ ...famData, profileId, status: 'approved' } as any, tx);
                            break;
                        case 'workHistory':
                            const whData = workHistorySchema.parse(data);
                            results[key] = subId 
                                ? await profileSubRepo.updateWorkHistory(subId, { ...whData, status: 'approved', approvedBy }, tx) 
                                : await profileSubRepo.createWorkHistory({ ...whData, profileId, status: 'approved', approvedBy }, tx);
                            break;
                        case 'extraInfo':
                            const exData = extraInfoSchema.parse(data);
                            results[key] = await profileSubRepo.upsertExtraInfo(profileId, exData, tx);
                            break;
                        case 'healthRecords':
                            const hrData = healthSchema.parse(data);
                            results[key] = await profileSubRepo.upsertHealthRecords(profileId, hrData as any, tx);
                            break;
                        case 'position':
                            const posData = positionSchema.parse(data);
                            results[key] = subId 
                                ? await profileSubRepo.updatePosition(subId, posData, tx) 
                                : await profileSubRepo.createPosition({ ...posData, profileId }, tx);
                            break;
                        case 'researchWork':
                            const rwData = researchWorkSchema.parse(data);
                            results[key] = subId 
                                ? await profileSubRepo.updateResearchWork(subId, { ...rwData, status: 'approved', verifiedBy: approvedBy }, tx) 
                                : await profileSubRepo.createResearchWork({ ...rwData, profileId, status: 'approved', verifiedBy: approvedBy }, tx);
                            break;
                    }
                }
            }
        }

        // Luôn chuyển trạng thái hồ sơ về 'approved' sau khi xong tất cả
        await profileRepo.update(profileId, { profileStatus: 'approved', updatedAt: new Date() }, tx)

        try { await rDel(CacheKey.profileFull(profileId)) } catch (e) { console.error('Redis cache error:', e) }
        return results
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
    /**
     * Xử lý khi Workflow yêu cầu chỉnh sửa (Revision)
     */
    async handleRevisionFromWorkflow(workflowId: ID, actorId: ID, tx?: any): Promise<void> {
        const inst = await workflowEngine.getStatus(workflowId)
        const profileId = inst.resourceId
        
        // Khi yêu cầu sửa, ta có thể chuyển về 'draft' hoặc vẫn để 'pending' nhưng user có quyền edit.
        // Ở đây chuyển về 'draft' để user biết cần sửa.
        await profileRepo.update(profileId, {
            profileStatus: 'draft',
            lastUpdatedBy: actorId
        }, tx)

        try { await rDel(CacheKey.profileFull(profileId)) } catch (e) { console.error('Redis cache error:', e) }
    }
}

export const profileService = new ProfileService()

// Register workflow handlers for the dispatcher
registerWorkflowHandler(
    'profile',
    (inst, actorId, tx) => profileService.applyChangesFromWorkflow(inst.id, actorId, tx),
    (inst, actorId, tx) => profileService.handleRejectionFromWorkflow(inst.id, actorId, tx),
    (inst, actorId, tx) => profileService.handleRevisionFromWorkflow(inst.id, actorId, tx)
)

