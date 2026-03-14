import { db } from "@/configs/db"
import { ID, PaginationQuery, PaginatedResult } from "@/types"
import { profileStaff } from "@/db/schema"
import { eq, ilike, or, and, sql, count, desc, asc, isNull } from "drizzle-orm"

export interface ProfileFilter {
    unitId?: ID
    staffType?: string
    employmentStatus?: string
    keyword?: string
    profileStatus?: string
}

export type ProfileRow = typeof profileStaff.$inferSelect

export class ProfileRepository {
    /**
     * Get danh sách profiles với filter và pagination
     */
    async findMany(
        filter: ProfileFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<ProfileRow>> {
        const conditions: any[] = [isNull(profileStaff.deletedAt)]

        if (filter.unitId) {
            conditions.push(eq(profileStaff.unitId, filter.unitId))
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
                ilike(profileStaff.idNumber, kw)
            ))
        }

        const whereClause = and(...conditions)

        // Count total
        const countResult = await db.select({ total: count() }).from(profileStaff).where(whereClause)
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

        const rows = await db.select()
            .from(profileStaff)
            .where(whereClause)
            .limit(pagination.limit)
            .offset(offset)
            .orderBy(orderBy)

        return {
            data: rows,
            total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(total / pagination.limit)
        }
    }

    /**
     * Get profile by ID
     */
    async findById(id: ID): Promise<ProfileRow | null> {
        const result = await db.select()
            .from(profileStaff)
            .where(and(eq(profileStaff.id, id), isNull(profileStaff.deletedAt)))
            .limit(1)
        return result[0] ?? null
    }

    /**
     * Get profile by user_id
     */
    async findByUserId(userId: ID): Promise<ProfileRow | null> {
        const result = await db.select()
            .from(profileStaff)
            .where(and(eq(profileStaff.userId, userId), isNull(profileStaff.deletedAt)))
            .limit(1)
        return result[0] ?? null
    }

    /**
     * Create profile mới
     */
    async create(data: any): Promise<ProfileRow> {
        const result = await db.insert(profileStaff)
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
    async update(id: ID, data: any): Promise<ProfileRow> {
        const result = await db.update(profileStaff)
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
    async delete(id: ID): Promise<void> {
        await db.update(profileStaff)
            .set({ deletedAt: new Date() })
            .where(eq(profileStaff.id, id))
    }

    /**
     * Get số lượng profiles theo unit
     */
    async countByUnit(unitId: ID): Promise<number> {
        const result = await db.select({ total: count() })
            .from(profileStaff)
            .where(and(eq(profileStaff.unitId, unitId), isNull(profileStaff.deletedAt)))
        return Number(result[0].total)
    }

    /**
     * Tìm kiếm profiles theo keyword (full-text search)
     */
    async search(keyword: string, limit = 10): Promise<ProfileRow[]> {
        const kw = `%${keyword}%`
        return await db.select()
            .from(profileStaff)
            .where(and(
                isNull(profileStaff.deletedAt),
                or(
                    ilike(profileStaff.emailVnu, kw),
                    ilike(profileStaff.idNumber, kw)
                )
            ))
            .limit(limit)
    }
}

export const profileRepo = new ProfileRepository()
