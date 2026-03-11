import { profileRepo, ProfileFilter, ProfileRow } from "./profile.repo"
import { profileSubRepo } from "./profileSub.repo"
import { UUID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { CacheKey, CacheTTL } from "@/core/cache/cacheKey"
import { rSetJson, rGetJson, rDel, rExists } from "@/configs/redis"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"

export interface FullProfileRow extends ProfileRow {
    education?: any[]
    family?: any[]
    workHistory?: any[]
    extraInfo?: any
    healthRecords?: any
}

export interface CreateProfileDto {
    userId: UUID
    unitId: UUID
    emailVnu?: string
    emailPersonal?: string
    phoneWork?: string
    phoneHome?: string
    dateOfBirth?: Date
    gender?: string
    idNumber?: string
    idIssuedDate?: Date
    idIssuedBy?: string
    nationality?: string
    ethnicity?: string
    religion?: string
    maritalStatus?: string
    policyObject?: string
    nickName?: string
    passportNumber?: string
    passportIssuedAt?: Date
    passportIssuedBy?: string
    insuranceNumber?: string
    insuranceJoinedAt?: Date
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
    joinDate?: Date
    retireDate?: Date
    profileStatus?: string
}

export interface UpdateProfileDto extends Partial<CreateProfileDto> {
    lastUpdatedBy: UUID
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
        // ABAC: Check nếu user chỉ được xem unit của mình
        const scopes = await abacService.getUnitFilter([
            { scopeType: 'faculty', unitId: user.unitId },
            { scopeType: 'department', unitId: user.unitId }
        ])

        // Nếu không phải school-level, chỉ cho xem unit của mình
        if (scopes !== 'all' && !filter.unitId) {
            filter.unitId = scopes || undefined
        }

        return await profileRepo.findMany(filter, pagination)
    }

    /**
     * Get profile by ID với cache
     */
    async getProfileById(id: UUID): Promise<FullProfileRow | null> {
        // Try cache first
        const cacheKey = CacheKey.profileFull(id)
        const cached = await rGetJson<FullProfileRow>(cacheKey)
        if (cached) {
            return cached
        }

        const profile = await profileRepo.findById(id) as FullProfileRow
        if (profile) {
            // Fetch sub-sections
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
    async getMyProfile(userId: UUID): Promise<FullProfileRow | null> {
        const main = await profileRepo.findByUserId(userId)
        if (!main) return null
        return await this.getProfileById(main.id)
    }

    /**
     * Create profile mới
     */
    async createProfile(data: CreateProfileDto, createdBy: UUID): Promise<ProfileRow> {
        const profile = await profileRepo.create({
            ...data,
            user_id: data.userId,
            unit_id: data.unitId,
            created_by: createdBy
        })

        // Register resource scope cho ABAC
        await abacService.registerScope({
            resourceType: 'profile',
            resourceId: profile.id,
            ownerId: profile.user_id,
            unitId: profile.unit_id
        })

        return profile
    }

    /**
     * Update profile
     */
    async updateProfile(
        id: UUID,
        data: UpdateProfileDto,
        user: AuthUser
    ): Promise<ProfileRow> {
        const existing = await profileRepo.findById(id)
        if (!existing) {
            throw new NotFoundError('Profile not found')
        }

        // ABAC: Check permission update
        const canUpdate = await abacService.canAccess(
            [
                { scopeType: 'school', unitId: null },
                { scopeType: 'faculty', unitId: user.unitId },
                { scopeType: 'self', unitId: null }
            ],
            'profile',
            id
        )

        // Cho phép self-update
        const isSelf = existing.user_id === user.id

        if (!canUpdate && !isSelf) {
            throw new ForbiddenError('You do not have permission to update this profile')
        }

        const updated = await profileRepo.update(id, {
            ...data,
            last_updated_by: user.id
        })

        // Invalidate cache
        await rDel(CacheKey.profileFull(id))

        return updated
    }

    /**
     * Soft delete profile
     */
    async deleteProfile(id: UUID, user: AuthUser): Promise<void> {
        const existing = await profileRepo.findById(id)
        if (!existing) {
            throw new NotFoundError('Profile not found')
        }

        // ABAC: Check permission delete
        const canDelete = await abacService.canAccess(
            [{ scopeType: 'school', unitId: null }],
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
     * Approve profile (chuyển status)
     */
    async approveProfile(id: UUID, approvedBy: UUID): Promise<ProfileRow> {
        const updated = await profileRepo.update(id, {
            profile_status: 'approved',
            last_updated_by: approvedBy
        })

        if (!updated) {
            throw new NotFoundError('Profile not found')
        }

        await rDel(CacheKey.profileFull(id))
        return updated
    }

    /**
     * Reject profile (trở về draft)
     */
    async rejectProfile(id: UUID, rejectedBy: UUID): Promise<ProfileRow> {
        const updated = await profileRepo.update(id, {
            profile_status: 'draft',
            last_updated_by: rejectedBy
        })

        if (!updated) {
            throw new NotFoundError('Profile not found')
        }

        await rDel(CacheKey.profileFull(id))
        return updated
    }

    /**
     * Change profile status (active, inactive, etc.)
     */
    async changeStatus(
        id: UUID,
        status: string,
        user: AuthUser
    ): Promise<ProfileRow> {
        const updated = await profileRepo.update(id, {
            employment_status: status,
            last_updated_by: user.id
        })

        if (!updated) {
            throw new NotFoundError('Profile not found')
        }

        await rDel(CacheKey.profileFull(id))
        return updated
    }
}

export const profileService = new ProfileService()
