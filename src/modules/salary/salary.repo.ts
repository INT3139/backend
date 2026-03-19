import { db } from "@/configs/db"
import { ID, PaginationQuery, PaginatedResult } from "@/types"
import { salaryInfo, salaryLogs, salaryUpgradeProposals, profileStaff } from "@/db/schema"
import { eq, and, sql, count, desc, inArray } from "drizzle-orm"

export type SalaryInfoRow = typeof salaryInfo.$inferSelect
export type SalaryUpgradeProposalRow = typeof salaryUpgradeProposals.$inferSelect
export type SalaryLogRow = typeof salaryLogs.$inferSelect

export interface SalaryFilter {
    unitId?: number
    unitIds?: number[]
    status?: string
}

export class SalaryRepo {
    /**
     * Get salary info by profile id
     */
    async findByProfileId(profileId: ID, tx?: any): Promise<SalaryInfoRow | null> {
        const result = await (tx || db).select()
            .from(salaryInfo)
            .where(eq(salaryInfo.profileId, profileId))
            .limit(1)
        return result[0] ?? null
    }

    /**
     * Get salary info by user id (via profile)
     */
    async findByUserId(userId: ID, tx?: any): Promise<SalaryInfoRow | null> {
        const result = await (tx || db).select({
            salary: salaryInfo
        })
        .from(salaryInfo)
        .innerJoin(profileStaff, eq(salaryInfo.profileId, profileStaff.id))
        .where(eq(profileStaff.userId, userId))
        .limit(1)
        
        return result[0]?.salary ?? null
    }

    /**
     * Update salary info
     */
    async update(profileId: ID, data: any, tx?: any): Promise<SalaryInfoRow> {
        const result = await (tx || db).update(salaryInfo)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(salaryInfo.profileId, profileId))
            .returning()
        return result[0]
    }

    /**
     * Create salary log
     */
    async createLog(data: any, tx?: any): Promise<SalaryLogRow> {
        const res = await (tx || db).insert(salaryLogs)
            .values(data)
            .returning()
        return res[0]
    }

    /**
     * Find many upgrade proposals with filter and pagination
     */
    async findProposals(
        filter: SalaryFilter,
        pagination: PaginationQuery,
        tx?: any
    ): Promise<PaginatedResult<SalaryUpgradeProposalRow>> {
        const { page, limit } = pagination
        const offset = (page - 1) * limit

        const conditions = []
        
        if (filter.unitId) {
            conditions.push(eq(profileStaff.unitId, filter.unitId))
        } else if (filter.unitIds && filter.unitIds.length > 0) {
            conditions.push(inArray(profileStaff.unitId, filter.unitIds))
        }
        
        if (filter.status) {
            conditions.push(eq(salaryUpgradeProposals.status, filter.status as any))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : sql`TRUE`

        // Count total
        const countRes = await (tx || db).select({ total: count() })
            .from(salaryUpgradeProposals)
            .innerJoin(profileStaff, eq(salaryUpgradeProposals.profileId, profileStaff.id))
            .where(whereClause)
        const total = Number(countRes[0].total)

        // Get data
        const rows = await (tx || db).select({
            id: salaryUpgradeProposals.id,
            profileId: salaryUpgradeProposals.profileId,
            currentOccupationCode: salaryUpgradeProposals.currentOccupationCode,
            currentGrade: salaryUpgradeProposals.currentGrade,
            currentCoefficient: salaryUpgradeProposals.currentCoefficient,
            currentEffectiveDate: salaryUpgradeProposals.currentEffectiveDate,
            currentTitle: salaryUpgradeProposals.currentTitle,
            attachmentId: salaryUpgradeProposals.attachmentId,
            status: salaryUpgradeProposals.status,
            proposedGrade: salaryUpgradeProposals.proposedGrade,
            proposedCoefficient: salaryUpgradeProposals.proposedCoefficient,
            proposedNextDate: salaryUpgradeProposals.proposedNextDate,
            upgradeType: salaryUpgradeProposals.upgradeType,
            workflowId: salaryUpgradeProposals.workflowId,
            createdAt: salaryUpgradeProposals.createdAt
        })
            .from(salaryUpgradeProposals)
            .innerJoin(profileStaff, eq(salaryUpgradeProposals.profileId, profileStaff.id))
            .where(whereClause)
            .orderBy(desc(salaryUpgradeProposals.createdAt))
            .limit(limit)
            .offset(offset)

        return {
            data: rows as SalaryUpgradeProposalRow[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    /**
     * Create new upgrade proposal
     */
    async createProposal(data: any, tx?: any): Promise<SalaryUpgradeProposalRow> {
        const res = await (tx || db).insert(salaryUpgradeProposals)
            .values(data)
            .returning()
        return res[0]
    }

    /**
     * Get proposal by ID
     */
    async findProposalById(id: ID, tx?: any): Promise<SalaryUpgradeProposalRow | null> {
        const result = await (tx || db).select()
            .from(salaryUpgradeProposals)
            .where(eq(salaryUpgradeProposals.id, id))
            .limit(1)
        return result[0] ?? null
    }

    /**
     * Update proposal status
     */
    async updateProposalStatus(id: ID, status: string, tx?: any): Promise<SalaryUpgradeProposalRow> {
        const res = await (tx || db).update(salaryUpgradeProposals)
            .set({ status: status as any })
            .where(eq(salaryUpgradeProposals.id, id))
            .returning()
        return res[0]
    }
}

export const salaryRepo = new SalaryRepo()
