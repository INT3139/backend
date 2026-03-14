import { db } from "@/configs/db"
import { ID, PaginationQuery, PaginatedResult } from "@/types"
import { rewardCommendations, rewardTitles, rewardDisciplinaryRecords, profileStaff } from "@/db/schema"
import { eq, and, sql, count, desc, asc, inArray } from "drizzle-orm"

export interface RewardFilter {
    unitId?: number
    academicYear?: string
    awardedYear?: string
}

export type CommendationRow = typeof rewardCommendations.$inferSelect
export type TitleRow = typeof rewardTitles.$inferSelect
export type DisciplineRow = typeof rewardDisciplinaryRecords.$inferSelect

export class RewardRepo {
    /**
     * Get commendations
     */
    async findCommendations(
        filter: RewardFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<CommendationRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const conditions = []
        if (filter.unitId) {
            const profileIdsQuery = db.select({ id: profileStaff.id })
                .from(profileStaff)
                .where(eq(profileStaff.unitId, filter.unitId))
            conditions.push(inArray(rewardCommendations.profileId, profileIdsQuery))
        }
        if (filter.academicYear) {
            conditions.push(eq(rewardCommendations.academicYear, filter.academicYear))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countRes = await db.select({ total: count() })
            .from(rewardCommendations)
            .where(whereClause)
        const total = Number(countRes[0].total)

        let orderBy: any = desc(rewardCommendations.createdAt)
        if (sort) {
            const column = (rewardCommendations as any)[sort]
            if (column) {
                orderBy = order === 'asc' ? asc(column) : desc(column)
            }
        }

        const rows = await db.select()
            .from(rewardCommendations)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(orderBy)

        return {
            data: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    /**
     * Get rewards by profile ID
     */
    async findByProfileId(profileId: ID) {
        const [commendations, titles, discipline] = await Promise.all([
            db.select().from(rewardCommendations).where(eq(rewardCommendations.profileId, profileId)).orderBy(desc(rewardCommendations.decisionDate)),
            db.select().from(rewardTitles).where(eq(rewardTitles.profileId, profileId)).orderBy(desc(rewardTitles.awardedYear)),
            db.select().from(rewardDisciplinaryRecords).where(eq(rewardDisciplinaryRecords.profileId, profileId)).orderBy(desc(rewardDisciplinaryRecords.issuedDate))
        ])

        return {
            commendations,
            titles,
            discipline
        }
    }

    /**
     * Get rewards by user ID
     */
    async findByUserId(userId: ID) {
        const profile = await db.select({ id: profileStaff.id })
            .from(profileStaff)
            .where(eq(profileStaff.userId, userId))
            .limit(1)
        
        if (profile.length === 0) return null
        return await this.findByProfileId(profile[0].id)
    }

    /**
     * Create commendation
     */
    async createCommendation(data: any): Promise<CommendationRow> {
        const res = await db.insert(rewardCommendations)
            .values(data)
            .returning()
        return res[0]
    }

    /**
     * Update commendation
     */
    async updateCommendation(id: ID, data: any): Promise<CommendationRow | null> {
        const res = await db.update(rewardCommendations)
            .set(data)
            .where(eq(rewardCommendations.id, id))
            .returning()
        return res[0] ?? null
    }

    /**
     * Delete commendation
     */
    async deleteCommendation(id: ID): Promise<boolean> {
        await db.delete(rewardCommendations).where(eq(rewardCommendations.id, id))
        return true
    }

    /**
     * Get titles
     */
    async findTitles(
        filter: RewardFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<TitleRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const conditions = []
        if (filter.unitId) {
            const profileIdsQuery = db.select({ id: profileStaff.id })
                .from(profileStaff)
                .where(eq(profileStaff.unitId, filter.unitId))
            conditions.push(inArray(rewardTitles.profileId, profileIdsQuery))
        }
        if (filter.awardedYear) {
            conditions.push(eq(rewardTitles.awardedYear, filter.awardedYear))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countRes = await db.select({ total: count() })
            .from(rewardTitles)
            .where(whereClause)
        const total = Number(countRes[0].total)

        let orderBy: any = desc(rewardTitles.createdAt)
        if (sort) {
            const column = (rewardTitles as any)[sort]
            if (column) {
                orderBy = order === 'asc' ? asc(column) : desc(column)
            }
        }

        const rows = await db.select()
            .from(rewardTitles)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(orderBy)

        return {
            data: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    /**
     * Create title
     */
    async createTitle(data: any): Promise<TitleRow> {
        const res = await db.insert(rewardTitles)
            .values(data)
            .returning()
        return res[0]
    }

    /**
     * Update title
     */
    async updateTitle(id: ID, data: any): Promise<TitleRow | null> {
        const res = await db.update(rewardTitles)
            .set(data)
            .where(eq(rewardTitles.id, id))
            .returning()
        return res[0] ?? null
    }

    /**
     * Delete title
     */
    async deleteTitle(id: ID): Promise<boolean> {
        await db.delete(rewardTitles).where(eq(rewardTitles.id, id))
        return true
    }

    /**
     * Get disciplinary records
     */
    async findDisciplinaryRecords(
        filter: RewardFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<DisciplineRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const conditions = []
        if (filter.unitId) {
            const profileIdsQuery = db.select({ id: profileStaff.id })
                .from(profileStaff)
                .where(eq(profileStaff.unitId, filter.unitId))
            conditions.push(inArray(rewardDisciplinaryRecords.profileId, profileIdsQuery))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countRes = await db.select({ total: count() })
            .from(rewardDisciplinaryRecords)
            .where(whereClause)
        const total = Number(countRes[0].total)

        let orderBy: any = desc(rewardDisciplinaryRecords.createdAt)
        if (sort) {
            const column = (rewardDisciplinaryRecords as any)[sort]
            if (column) {
                orderBy = order === 'asc' ? asc(column) : desc(column)
            }
        }

        const rows = await db.select()
            .from(rewardDisciplinaryRecords)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(orderBy)

        return {
            data: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    /**
     * Create disciplinary record
     */
    async createDiscipline(data: any): Promise<DisciplineRow> {
        const res = await db.insert(rewardDisciplinaryRecords)
            .values(data)
            .returning()
        return res[0]
    }

    /**
     * Update disciplinary record
     */
    async updateDiscipline(id: ID, data: any): Promise<DisciplineRow | null> {
        const res = await db.update(rewardDisciplinaryRecords)
            .set(data)
            .where(eq(rewardDisciplinaryRecords.id, id))
            .returning()
        return res[0] ?? null
    }

    /**
     * Delete disciplinary record
     */
    async deleteDiscipline(id: ID): Promise<boolean> {
        await db.delete(rewardDisciplinaryRecords).where(eq(rewardDisciplinaryRecords.id, id))
        return true
    }
}

export const rewardRepo = new RewardRepo()

