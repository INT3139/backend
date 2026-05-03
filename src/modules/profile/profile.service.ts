import { db } from "@/configs/db"
import { eq, sql, desc } from "drizzle-orm"
import { profileRepo, ProfileFilter, ProfileRow, ProfileListRow } from "./profile.repo"
import { profileStaff, profileFamilyRelations, profileWorkHistories, profileResearchWorks } from "@/db/schema"
import { wfInstances, wfStepLogs } from "@/db/schema/workflow"
import { profileSubRepo } from "./profileSub.repo"
import { ID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { permissionService } from "@/core/permissions/permission.service"
import { CacheKey, CacheTTL } from "@/core/cache/cacheKey"
import { rSetJson, rGetJson, rDel } from "@/configs/redis"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"
import { workflowEngine, type WorkflowInstance } from "@/core/workflow/engine"
import { WF } from "@/constants/workflowCodes"
import { registerWorkflowHandler } from "@/core/workflow/workflow.dispatcher"
import { updateProfileSchema } from "./profile.schema"
import { storageService } from "@/services/storage.service"
import { educationSchema, familySchema, workHistorySchema, extraInfoSchema, healthSchema, positionSchema, createResearchWorkSchema, updateResearchWorkSchema } from "./profileSub.schema"
import { notificationService } from "@/services/notification.service"
import { calculateDiff } from "@/utils/diff"

export interface FullProfileRow extends ProfileRow {
    avatarUrl?: string
    education?: any[]
    family?: any[]
    workHistory?: any[]
    extraInfo?: any
    healthRecords?: any
    positions?: any[]
    researchWorks?: {
        data: any[]
        summary: any[]
    }
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
    avatarDefault?: boolean
    avatarUrl?: string
    note?: string
    origin?: string
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
        user: AuthUser
    ) {
        const scopes = await permissionService.getScopes(user)
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
        if (profile) {
            const activeWf = await profileRepo.findActiveWorkflow(id)
            if (activeWf) {
                const metadata = activeWf.metadata || {}
                const pending: any = {}
                const processed: any = {}

                // Phân loại: item nào có 'status' là đã xử lý lẻ, còn lại là đang chờ
                for (const [key, value] of Object.entries(metadata)) {
                    if (key === 'main' || key.startsWith('sub_')) {
                        const item = value as any
                        if (item.status) {
                            processed[key] = item
                        } else {
                            pending[key] = item
                        }
                    }
                }

                profile.pendingChanges = pending
                if (Object.keys(processed).length > 0) {
                    (profile as any).processedChanges = processed
                }
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
        return await db.transaction(async (tx) => {
            // Lock row để tránh race condition và đảm bảo atomicity
            const [existing] = await tx
                .select()
                .from(profileStaff)
                .where(eq(profileStaff.id, id))
                .for('update')
            
            if (!existing) {
                throw new NotFoundError('Profile not found')
            }

            const isSelf = existing.userId === user.id
            if (!isSelf) {
                const scopes = await permissionService.getScopes(user)
                const canUpdate = await abacService.canAccess(user.id, scopes, 'profile', id)
                if (!canUpdate) {
                    throw new ForbiddenError('You do not have permission to update this profile')
                }
            }

            const changeKey = 'main'
            const changeData = { [changeKey]: data }

            // Kiểm tra xem đã có Workflow nào đang chạy chưa
            const activeWf = await profileRepo.findActiveWorkflow(id, tx)
            if (activeWf) {
                // Merge metadata ngay tại đây để tránh ghi đè (Cộng dồn thay đổi)
                await profileRepo.appendWorkflowMetadata(activeWf.id, changeData, tx)
                
                // Nếu hồ sơ đang ở 'draft' (do vừa bị Revision), ta chuyển nó về 'pending' lại
                if (existing.profileStatus !== 'pending') {
                    await profileRepo.update(id, { profileStatus: 'pending' }, tx)
                }
                return { 
                    message: 'Thay đổi thông tin chính đã được cập nhật vào danh sách chờ duyệt.', 
                    workflowId: activeWf.id 
                }
            }

            // Đặt trạng thái sang pending trước khi tạo workflow
            await profileRepo.update(id, { profileStatus: 'pending' }, tx)

            // Tạo workflow mới
            const workflow = await workflowEngine.initiate({
                definitionCode: WF.PROFILE_UPDATE,
                resourceType: 'profile',
                resourceId: id,
                initiatedBy: user.id,
                metadata: changeData
            }, tx)

            return {
                message: 'Yêu cầu cập nhật hồ sơ đã được gửi và đang chờ phê duyệt.',
                workflowId: workflow.id
            }
        })
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
        return await db.transaction(async (tx) => {
            // Lock row
            const [existing] = await tx
                .select()
                .from(profileStaff)
                .where(eq(profileStaff.id, profileId))
                .for('update')

            if (!existing) throw new NotFoundError('Profile not found')

            // Sử dụng key duy nhất cho từng bản ghi con để tránh ghi đè khi merge JSONB
            // Fix: 1-to-1 sub-modules dùng key cố định để merge data thay vì tạo key random mới
            let changeKey: string
            if (type === 'extraInfo' || type === 'healthRecords') {
                changeKey = `sub_${type}`
            } else {
                changeKey = `sub_${type}_${subId || 'new_' + Math.random().toString(36).substring(2, 9)}`
            }

            const changeData = {
                [changeKey]: { type, subId, data, action }
            }

            // Nếu cập nhật bản ghi đã tồn tại (có subId), set status của nó về 'pending' trong DB
            if (subId && (type === 'family' || type === 'workHistory' || type === 'researchWork')) {
                const tableMap: any = {
                    'family': profileFamilyRelations,
                    'workHistory': profileWorkHistories,
                    'researchWork': profileResearchWorks
                }
                const targetTable = tableMap[type]
                if (targetTable) {
                    await tx.update(targetTable)
                        .set({ status: 'pending' as any })
                        .where(eq(targetTable.id, subId as any))
                }
            }

            // Kiểm tra Workflow đang hoạt động
            const activeWf = await profileRepo.findActiveWorkflow(profileId, tx)
            if (activeWf) {
                await profileRepo.appendWorkflowMetadata(activeWf.id, changeData, tx)
                if (existing.profileStatus !== 'pending') {
                    await profileRepo.update(profileId, { profileStatus: 'pending' }, tx)
                }
                return { 
                    message: `Yêu cầu thay đổi ${type} đã được thêm vào danh sách chờ duyệt.`, 
                    workflowId: activeWf.id 
                }
            }

            // Set pending và tạo workflow
            await profileRepo.update(profileId, { profileStatus: 'pending' }, tx)

            const workflow = await workflowEngine.initiate({
                definitionCode: WF.PROFILE_UPDATE,
                resourceType: 'profile',
                resourceId: profileId,
                initiatedBy: user.id,
                metadata: changeData
            }, tx)

            return {
                message: `Yêu cầu thay đổi ${type} đã được gửi và đang chờ phê duyệt.`,
                workflowId: workflow.id
            }
        })
    }

    /**
     * Khôi phục trạng thái bản ghi con về 'approved' (dùng khi từ chối thay đổi lẻ)
     */
    async revertSubRecordStatus(type: string, subId: ID, tx?: any): Promise<void> {
        const tableMap: any = {
            'family': profileFamilyRelations,
            'workHistory': profileWorkHistories,
            'researchWork': profileResearchWorks
        }
        const targetTable = tableMap[type]
        if (targetTable && subId) {
            await (tx || db).update(targetTable)
                .set({ status: 'approved' as any })
                .where(eq(targetTable.id, subId as any))
        }
    }

    /**
     * Xử lý khi Workflow bị từ chối
     */
    async handleRejectionFromWorkflow(inst: WorkflowInstance, rejectedBy: ID, tx?: any): Promise<void> {
        const profileId = inst.resourceId
        const metadata = inst.metadata as any || {}

        // 1. Revert status cho tất cả các bản ghi con (sub-records) đang chờ duyệt
        for (const [key, value] of Object.entries(metadata)) {
            if (key.startsWith('sub_')) {
                const item = value as any
                if (item && item.subId && item.type) {
                    await this.revertSubRecordStatus(item.type, item.subId, tx)
                }
            }
        }

        // 2. Đưa trạng thái hồ sơ chính quay lại 'approved'
        await profileRepo.update(profileId, {
            profileStatus: 'approved',  // Revert to last stable state
            lastUpdatedBy: rejectedBy
        }, tx)

        // 3. Xóa các mục update trong metadata để tránh rác
        const clearedMetadata = { ...metadata }
        for (const key of Object.keys(clearedMetadata)) {
            if (key === 'main' || key.startsWith('sub_')) {
                delete clearedMetadata[key]
            }
        }

        await (tx || db)
            .update(wfInstances)
            .set({ metadata: clearedMetadata })
            .where(eq(wfInstances.id, inst.id))

        // 4. Gửi thông báo từ chối
        const [lastLog] = await (tx || db)
            .select()
            .from(wfStepLogs)
            .where(eq(wfStepLogs.instanceId, inst.id))
            .orderBy(desc(wfStepLogs.actedAt))
            .limit(1)

        await notificationService.enqueue({
            templateCode: 'workflow_rejected',
            recipientId: inst.initiatedBy,
            resourceType: 'profile',
            resourceId: inst.resourceId,
            payload: {
                reason: lastLog?.comment || 'Không có lý do cụ thể',
                instanceId: inst.id,
                resourceType: 'Hồ sơ'
            }
        })

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

        const scopes = await permissionService.getScopes(user)
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
    async applyChangesFromWorkflow(inst: WorkflowInstance, approvedBy: ID, tx?: any, finalize: boolean = true): Promise<any> {
        if (inst.status !== 'approved' && !finalize) {
            // Allow mock instances for partial approval
        } else if (inst.status !== 'approved') {
            throw new ForbiddenError('Workflow must be approved first')
        }

        const profileId = inst.resourceId
        const metadata = inst.metadata as any

        // Phân loại items để xử lý dựa trên cấu trúc phẳng
        let itemsToProcess: any = {}

        if (finalize) {
            // Khi kết thúc workflow, ta xử lý tất cả:
            // 1. Các item chưa được xử lý lẻ (không có status)
            // 2. Các item đã được xử lý lẻ với kết quả là 'approved' nhưng CHƯA ghi vào DB (applied !== true)
            for (const [key, value] of Object.entries(metadata)) {
                if (key === 'main' || key.startsWith('sub_')) {
                    const item = value as any
                    if ((!item.status || item.status === 'approved') && !item.applied) {
                        itemsToProcess[key] = item
                    }
                }
            }
        } else {
            // Trường hợp phê duyệt từng bước (nếu có dùng metadata thô)
            itemsToProcess = metadata
        }

        const results: any = {}

        // Duyệt qua các thay đổi
        for (const [key, item] of Object.entries(itemsToProcess)) {
            if (key === 'main') {
                const validData = updateProfileSchema.parse(item)
                results.main = await profileRepo.update(profileId, {
                    ...validData,
                    profileStatus: finalize ? 'approved' : 'pending',
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
                            const eduData = subId ? educationSchema.partial().parse(data) : educationSchema.parse(data);
                            results[key] = subId 
                                ? await profileSubRepo.updateEducation(subId, { ...eduData, status: 'approved' } as any, tx) 
                                : await profileSubRepo.createEducation({ ...eduData, profileId, status: 'approved' } as any, tx);
                            break;
                        case 'family':
                            const famData = subId ? familySchema.partial().parse(data) : familySchema.parse(data);
                            results[key] = subId 
                                ? await profileSubRepo.updateFamily(subId, { ...famData, status: 'approved' } as any, tx) 
                                : await profileSubRepo.createFamily({ ...famData, profileId, status: 'approved' } as any, tx);
                            break;
                        case 'workHistory':
                            const whData = subId ? workHistorySchema.partial().parse(data) : workHistorySchema.parse(data);
                            results[key] = subId 
                                ? await profileSubRepo.updateWorkHistory(subId, { ...whData, status: 'approved', approvedBy }, tx) 
                                : await profileSubRepo.createWorkHistory({ ...whData, profileId, status: 'approved', approvedBy }, tx);
                            break;
                        case 'extraInfo':
                            const exData = extraInfoSchema.partial().parse(data);
                            results[key] = await profileSubRepo.upsertExtraInfo(profileId, exData, tx);
                            break;
                        case 'healthRecords':
                            const hrData = healthSchema.partial().parse(data);
                            results[key] = await profileSubRepo.upsertHealthRecords(profileId, hrData as any, tx);
                            break;
                        case 'position':
                            const posData = subId ? positionSchema.partial().parse(data) : positionSchema.parse(data);
                            results[key] = subId 
                                ? await profileSubRepo.updatePosition(subId, { ...posData, status: 'approved' } as any, tx) 
                                : await profileSubRepo.createPosition({ ...posData, profileId, status: 'approved' } as any, tx);
                            break;
                        case 'researchWork':
                            const rwData = subId ? updateResearchWorkSchema.parse(data) : createResearchWorkSchema.parse(data);
                            results[key] = subId 
                                ? await profileSubRepo.updateResearchWork(subId, { ...rwData, status: 'approved', verifiedBy: approvedBy }, tx) 
                                : await profileSubRepo.createResearchWork({ ...rwData, profileId, status: 'approved', verifiedBy: approvedBy }, tx);
                            break;
                    }
                }
            }
        }

        // Chỉ chuyển trạng thái hồ sơ về 'approved' nếu là bước finalize (hết workflow)
        if (finalize) {
            const currentProfile = await profileRepo.findById(profileId)
            const diff = calculateDiff(currentProfile, metadata.main?.data || metadata.main)

            if (diff) {
                await notificationService.enqueue({
                    templateCode: 'workflow_approved',
                    recipientId: inst.initiatedBy,
                    resourceType: 'profile',
                    resourceId: profileId,
                    payload: {
                        diff,
                        instanceId: inst.id,
                        resourceType: 'Hồ sơ'
                    }
                })
            }

            await profileRepo.update(profileId, { profileStatus: 'approved', updatedAt: new Date() }, tx)
        }

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
     * Gỡ ảnh đại diện, xóa tệp tin và dùng ảnh mặc định
     */
    async removeAvatar(id: ID, actorId: ID): Promise<void> {
        const existing = await profileRepo.findById(id)
        if (!existing) throw new NotFoundError('Profile not found')

        // 1. Tìm tệp ảnh đại diện hiện tại
        const attachments = await storageService.listAttachments('profile', id)
        
        // 2. Xóa các tệp ảnh này khỏi S3 và DB
        for (const att of attachments) {
            await storageService.deleteAttachment(att.id, actorId)
        }

        // 3. Cập nhật profile để dùng ảnh mặc định
        await profileRepo.update(id, {
            avatarDefault: true,
            lastUpdatedBy: actorId
        })

        // 4. Clear cache
        await rDel(CacheKey.profileFull(id))
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
    async handleRevisionFromWorkflow(inst: WorkflowInstance, actorId: ID, tx?: any): Promise<void> {
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
    (inst, actorId, tx, finalize) => profileService.applyChangesFromWorkflow(inst, actorId, tx, finalize),
    (inst, actorId, tx) => profileService.handleRejectionFromWorkflow(inst, actorId, tx),
    (inst, actorId, tx) => profileService.handleRevisionFromWorkflow(inst, actorId, tx)
)

