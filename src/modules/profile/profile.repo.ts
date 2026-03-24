import { db } from "@/configs/db"
import { ID, PaginationQuery, PaginatedResult } from "@/types"
import { profileStaff, users } from "@/db/schema"
import { eq, ilike, or, and, sql, count, desc, asc, isNull, inArray, ne } from "drizzle-orm"

export interface ProfileFilter {
    unitId?: ID
    unitIds?: ID[]
    staffType?: string
    employmentStatus?: string
    keyword?: string
    profileStatus?: string
}

export type ProfileRow = typeof profileStaff.$inferSelect

export interface ProfileListRow extends ProfileRow {
    user: {
        fullName: string | null
        username: string
        email: string
    }
}

export class ProfileRepository {
    /**
     * Get danh sách profiles với filter và pagination
     */
    async findMany(
        filter: ProfileFilter,
        pagination: PaginationQuery,
        tx?: any
    ): Promise<PaginatedResult<ProfileListRow>> {
        const conditions: any[] = [isNull(profileStaff.deletedAt)]

        if (filter.unitId) {
            conditions.push(eq(profileStaff.unitId, filter.unitId))
        } else if (filter.unitIds && filter.unitIds.length > 0) {
            conditions.push(inArray(profileStaff.unitId, filter.unitIds))
        }
        if (filter.staffType) {
            conditions.push(eq(profileStaff.staffType, filter.staffType as any))
        }
        if (filter.employmentStatus) {
            conditions.push(eq(profileStaff.employmentStatus, filter.employmentStatus as any))
        }
        if (filter.profileStatus) {
            conditions.push(eq(profileStaff.profileStatus, filter.profileStatus as any))
        }
        if (filter.keyword) {
            const kw = `%${filter.keyword}%`
            conditions.push(or(
                ilike(profileStaff.emailVnu, kw),
                ilike(profileStaff.idNumber, kw),
                ilike(users.fullName, kw)
            ))
        }

        const whereClause = and(...conditions)

        // Count total
        const countResult = await (tx || db)
            .select({ total: count() })
            .from(profileStaff)
            .innerJoin(users, eq(profileStaff.userId, users.id))
            .where(whereClause)
        const total = Number(countResult[0].total)

        // Get data
        const offset = (pagination.page - 1) * pagination.limit

        let orderBy: any = desc(profileStaff.createdAt)
        if (pagination.sort) {
            const column = (profileStaff as any)[pagination.sort]
            if (column) {
                orderBy = pagination.order === 'asc' ? asc(column) : desc(column)
            }
        }

        const rows = await (tx || db)
            .select({
                profile: profileStaff,
                user: {
                    fullName: users.fullName,
                    username: users.username,
                    email: users.email
                }
            })
            .from(profileStaff)
            .innerJoin(users, eq(profileStaff.userId, users.id))
            .where(whereClause)
            .limit(pagination.limit)
            .offset(offset)
            .orderBy(orderBy)

        return {
            data: rows.map((r: any) => ({ ...r.profile, user: r.user })),
            total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(total / pagination.limit)
        }
    }

    /**
     * Get profile by ID
     */
    async findById(id: ID, tx?: any): Promise<any | null> {
        const result = await (tx || db).select({
            profile: profileStaff,
            user: {
                fullName: users.fullName,
                username: users.username,
                email: users.email
            }
        })
            .from(profileStaff)
            .innerJoin(users, eq(profileStaff.userId, users.id))
            .where(and(eq(profileStaff.id, id), isNull(profileStaff.deletedAt)))
            .limit(1)
        
        if (!result[0]) return null
        
        return {
            ...result[0].profile,
            user: result[0].user
        }
    }

    /**
     * Get profile by user_id
     */
    async findByUserId(userId: ID, tx?: any): Promise<ProfileRow | null> {
        const result = await (tx || db).select()
            .from(profileStaff)
            .where(and(eq(profileStaff.userId, userId), isNull(profileStaff.deletedAt)))
            .limit(1)
        return result[0] ?? null
    }

    /**
     * Create profile mới
     */
    async create(data: any, tx?: any): Promise<ProfileRow> {
        const result = await (tx || db).insert(profileStaff)
            .values({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning()
        return result[0]
    }

    /**
     * Update profile
     */
    async update(id: ID, data: any, tx?: any): Promise<ProfileRow> {
        const result = await (tx || db).update(profileStaff)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(profileStaff.id, id))
            .returning()
        return result[0]
    }

    /**
     * Soft delete profile
     */
    async delete(id: ID, tx?: any): Promise<void> {
        await (tx || db).update(profileStaff)
            .set({ deletedAt: new Date() })
            .where(eq(profileStaff.id, id))
    }

    /**
     * Get số lượng profiles theo unit
     */
    async countByUnit(unitId: ID, tx?: any): Promise<number> {
        const result = await (tx || db).select({ total: count() })
            .from(profileStaff)
            .where(and(eq(profileStaff.unitId, unitId), isNull(profileStaff.deletedAt)))
        return Number(result[0].total)
    }

    /**
     * Tìm kiếm profiles theo keyword (full-text search)
     */
    async search(keyword: string, limit = 10, tx?: any): Promise<ProfileListRow[]> {
        const kw = `%${keyword}%`
        const rows = await (tx || db)
            .select({
                profile: profileStaff,
                user: {
                    fullName: users.fullName,
                    username: users.username,
                    email: users.email
                }
            })
            .from(profileStaff)
            .innerJoin(users, eq(profileStaff.userId, users.id))
            .where(and(
                isNull(profileStaff.deletedAt),
                or(
                    ilike(profileStaff.emailVnu, kw),
                    ilike(profileStaff.idNumber, kw),
                    ilike(users.fullName, kw)
                )
            ))
            .limit(limit)
        return rows.map((r: any) => ({ ...r.profile, user: r.user }))
    }

    /**
     * Atomically set profile status to 'pending' only if it is not already pending.
     * Returns the updated row, or null if the profile was already pending.
     */
    async setPendingAtomically(id: ID, tx?: any): Promise<ProfileRow | null> {
        const result = await (tx || db)
            .update(profileStaff)
            .set({ profileStatus: 'pending' as any, updatedAt: new Date() })
            .where(and(eq(profileStaff.id, id), ne(profileStaff.profileStatus, 'pending')))
            .returning()
        return result[0] ?? null
    }

    /**
     * Tìm workflow đang hoạt động (pending hoặc in_progress) cho một profile
     */
    async findActiveWorkflow(profileId: ID, tx?: any): Promise<any | null> {
        const result = await (tx || db).execute(sql`
            SELECT id, metadata FROM wf_instances 
            WHERE resource_type = 'profile' 
            AND resource_id = ${profileId} 
            AND status IN ('pending', 'in_progress')
            LIMIT 1
        `)
        return result.rows[0] ?? null
    }

    /**
     * Merge thêm dữ liệu vào metadata của workflow hiện có (Atomic Merge)
     * Sử dụng toán tử || của PostgreSQL để gộp JSONB
     */
    async appendWorkflowMetadata(workflowId: ID, newMetadata: any, tx?: any): Promise<void> {
        await (tx || db).execute(sql`
            UPDATE wf_instances 
            SET metadata = metadata || ${JSON.stringify(newMetadata)}::jsonb,
                updated_at = NOW()
            WHERE id = ${workflowId}
        `)
    }
}

export const profileRepo = new ProfileRepository()
