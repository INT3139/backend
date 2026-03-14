import { db } from "@/configs/db"
import { ID, PaginationQuery, PaginatedResult } from "@/types"
import { workloadIndividualQuotas, workloadAnnualSummaries, workloadEvidences, profileStaff } from "@/db/schema"
import { eq, and, sql, count, desc, asc, inArray } from "drizzle-orm"

export type EvidenceRow = typeof workloadEvidences.$inferSelect
export type QuotaRow = typeof workloadIndividualQuotas.$inferSelect
export type SummaryRow = typeof workloadAnnualSummaries.$inferSelect

export interface WorkloadFilter {
    unitId?: number
    academicYear?: string
    status?: string
}

export class WorkloadRepo {
    /**
     * Get workload by profile ID
     */
    async findByProfileId(profileId: ID, academicYear: string) {
        const [quota, summary, evidences] = await Promise.all([
            db.select().from(workloadIndividualQuotas)
                .where(and(eq(workloadIndividualQuotas.profileId, profileId), eq(workloadIndividualQuotas.academicYear, academicYear)))
                .limit(1),
            db.select().from(workloadAnnualSummaries)
                .where(and(eq(workloadAnnualSummaries.profileId, profileId), eq(workloadAnnualSummaries.academicYear, academicYear)))
                .limit(1),
            db.select().from(workloadEvidences)
                .where(and(eq(workloadEvidences.profileId, profileId), eq(workloadEvidences.academicYear, academicYear)))
        ])

        return {
            quota: quota[0] ?? null,
            summary: summary[0] ?? null,
            evidences
        }
    }

    /**
     * Create evidence
     */
    async createEvidence(data: any): Promise<EvidenceRow> {
        const res = await db.insert(workloadEvidences)
            .values(data)
            .returning()
        return res[0]
    }

    /**
     * Find many evidences with filter and pagination
     */
    async findEvidences(
        filter: WorkloadFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<EvidenceRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const conditions = []
        if (filter.unitId) {
            const profileIds = db.select({ id: profileStaff.id })
                .from(profileStaff)
                .where(eq(profileStaff.unitId, filter.unitId))
            conditions.push(inArray(workloadEvidences.profileId, profileIds))
        }
        if (filter.academicYear) {
            conditions.push(eq(workloadEvidences.academicYear, filter.academicYear))
        }
        if (filter.status) {
            conditions.push(eq(workloadEvidences.status, filter.status as any))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countRes = await db.select({ total: count() })
            .from(workloadEvidences)
            .where(whereClause)
        const total = Number(countRes[0].total)

        let orderBy: any = desc(workloadEvidences.createdAt)
        if (sort) {
            const column = (workloadEvidences as any)[sort]
            if (column) {
                orderBy = order === 'asc' ? asc(column) : desc(column)
            }
        }

        const rows = await db.select()
            .from(workloadEvidences)
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
     * Find many summaries with filter and pagination
     */
    async findSummaries(
        filter: WorkloadFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<SummaryRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const conditions = []
        if (filter.unitId) {
            const profileIds = db.select({ id: profileStaff.id })
                .from(profileStaff)
                .where(eq(profileStaff.unitId, filter.unitId))
            conditions.push(inArray(workloadAnnualSummaries.profileId, profileIds))
        }
        if (filter.academicYear) {
            conditions.push(eq(workloadAnnualSummaries.academicYear, filter.academicYear))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countRes = await db.select({ total: count() })
            .from(workloadAnnualSummaries)
            .where(whereClause)
        const total = Number(countRes[0].total)

        let orderBy: any = desc(workloadAnnualSummaries.academicYear)
        if (sort) {
            const column = (workloadAnnualSummaries as any)[sort]
            if (column) {
                orderBy = order === 'asc' ? asc(column) : desc(column)
            }
        }

        const rows = await db.select()
            .from(workloadAnnualSummaries)
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
     * Update evidence status
     */
    async updateEvidenceStatus(id: number, status: string, reviewedBy: number, rejectReason?: string): Promise<EvidenceRow> {
        const res = await db.update(workloadEvidences)
            .set({
                status: status as any,
                reviewedBy,
                reviewedAt: new Date(),
                rejectReason: rejectReason || null
            })
            .where(eq(workloadEvidences.id, id))
            .returning()
        return res[0]
    }
}

export const workloadRepo = new WorkloadRepo()
