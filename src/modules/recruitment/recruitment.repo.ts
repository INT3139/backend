import { db } from "@/configs/db"
import { ID, PaginationQuery, PaginatedResult } from "@/types"
import { recruitmentProposals, recruitmentCandidates } from "@/db/schema"
import { eq, and, sql, count, desc, asc, ilike, or, inArray } from "drizzle-orm"

export interface RecruitmentProposalFilter {
    unitId?: number
    unitIds?: number[]
    status?: string
    keyword?: string
}

export type RecruitmentProposalRow = typeof recruitmentProposals.$inferSelect
export type CandidateRow = typeof recruitmentCandidates.$inferSelect

export class RecruitmentRepo {
    /**
     * Find many proposals with filter and pagination
     */
    async findMany(
        filter: RecruitmentProposalFilter,
        pagination: PaginationQuery,
        tx?: any
    ): Promise<PaginatedResult<RecruitmentProposalRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const conditions = []
        if (filter.unitId) {
            conditions.push(eq(recruitmentProposals.proposingUnit, filter.unitId))
        } else if (filter.unitIds && filter.unitIds.length > 0) {
            conditions.push(inArray(recruitmentProposals.proposingUnit, filter.unitIds))
        }
        if (filter.status) {
            conditions.push(eq(recruitmentProposals.status, filter.status as any))
        }
        if (filter.keyword) {
            const kw = `%${filter.keyword}%`
            conditions.push(or(
                ilike(recruitmentProposals.positionName, kw),
                ilike(recruitmentProposals.reason, kw)
            ))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countRes = await (tx || db).select({ total: count() })
            .from(recruitmentProposals)
            .where(whereClause)
        const total = Number(countRes[0].total)

        let orderBy: any = desc(recruitmentProposals.createdAt)
        if (sort) {
            const column = (recruitmentProposals as any)[sort]
            if (column) {
                orderBy = order === 'asc' ? asc(column) : desc(column)
            }
        }

        const rows = await (tx || db).select()
            .from(recruitmentProposals)
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
     * Find proposal by ID
     */
    async findById(id: ID, tx?: any): Promise<RecruitmentProposalRow | null> {
        const result = await (tx || db).select()
            .from(recruitmentProposals)
            .where(eq(recruitmentProposals.id, id))
            .limit(1)
        return result[0] ?? null
    }

    /**
     * Create new proposal
     */
    async create(data: any, tx?: any): Promise<RecruitmentProposalRow> {
        const res = await (tx || db).insert(recruitmentProposals)
            .values(data)
            .returning()
        return res[0]
    }

    /**
     * Update proposal
     */
    async update(id: ID, data: any, tx?: any): Promise<RecruitmentProposalRow> {
        const res = await (tx || db).update(recruitmentProposals)
            .set(data)
            .where(eq(recruitmentProposals.id, id))
            .returning()
        return res[0]
    }

    // --- CANDIDATE METHODS ---

    /**
     * Find many candidates with filter and pagination
     */
    async findCandidates(
        proposalId: ID,
        pagination: PaginationQuery,
        tx?: any
    ): Promise<PaginatedResult<CandidateRow>> {
        const { page, limit } = pagination
        const offset = (page - 1) * limit

        const countRes = await (tx || db).select({ total: count() })
            .from(recruitmentCandidates)
            .where(eq(recruitmentCandidates.proposalId, proposalId))
        const total = Number(countRes[0].total)

        const rows = await (tx || db).select()
            .from(recruitmentCandidates)
            .where(eq(recruitmentCandidates.proposalId, proposalId))
            .orderBy(desc(recruitmentCandidates.createdAt))
            .limit(limit)
            .offset(offset)

        return {
            data: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    /**
     * Find candidate by ID
     */
    async findCandidateById(id: ID, tx?: any): Promise<CandidateRow | null> {
        const result = await (tx || db).select()
            .from(recruitmentCandidates)
            .where(eq(recruitmentCandidates.id, id))
            .limit(1)
        return result[0] ?? null
    }

    /**
     * Create new candidate
     */
    async createCandidate(data: any, tx?: any): Promise<CandidateRow> {
        const res = await (tx || db).insert(recruitmentCandidates)
            .values(data)
            .returning()
        return res[0]
    }

    /**
     * Update candidate
     */
    async updateCandidate(id: ID, data: any, tx?: any): Promise<CandidateRow> {
        const res = await (tx || db).update(recruitmentCandidates)
            .set(data)
            .where(eq(recruitmentCandidates.id, id))
            .returning()
        return res[0]
    }

    /**
     * Delete candidate
     */
    async deleteCandidate(id: ID, tx?: any): Promise<boolean> {
        await (tx || db).delete(recruitmentCandidates)
            .where(eq(recruitmentCandidates.id, id))
        return true
    }

    // --- RECRUITMENT INFO & CONTRACTS ---

    /**
     * Get recruitment info by profile ID
     */
    async findInfoByProfileId(profileId: ID, tx?: any) {
        const { recruitmentInfo } = await import("@/db/schema/recruitment")
        const result = await (tx || db).select()
            .from(recruitmentInfo)
            .where(eq(recruitmentInfo.profileId, profileId))
            .limit(1)
        return result[0] ?? null
    }

    /**
     * Get recruitment contracts by profile ID
     */
    async findContractsByProfileId(profileId: ID, tx?: any) {
        const { recruitmentContracts } = await import("@/db/schema/recruitment")
        return await (tx || db).select()
            .from(recruitmentContracts)
            .where(eq(recruitmentContracts.profileId, profileId))
            .orderBy(desc(recruitmentContracts.startDate))
    }
}

export const recruitmentRepo = new RecruitmentRepo()
