import { db } from '@/configs/db'
import {
    organizationalUnits,
    profileStaff,
    resourceScopes,
    salaryInfo,
    salaryUpgradeProposals,
    users
} from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { salaryService } from '@/modules/salary/salary.service'
import { permissionService } from '@/core/permissions/permission.service'
import { emailService } from '@/services/email.service'
import { TestDbHelper } from '../helpers/testHelpers'

describe('Salary scope registration', () => {
    beforeEach(async () => {
        await TestDbHelper.clearAllTables()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('registers salary scope when updating salary info', async () => {
        const [unit] = await db.insert(organizationalUnits).values({
            name: 'Scope Unit',
            code: 'SCOPE_UNIT',
            unitType: 'faculty'
        }).returning()

        const [user] = await db.insert(users).values({
            username: 'salary_scope_user',
            email: 'salary_scope_user@example.com',
            fullName: 'Salary Scope User',
            passwordHash: 'hash',
            isActive: true,
            unitId: unit.id
        }).returning()

        const [profile] = await db.insert(profileStaff).values({
            userId: user.id,
            unitId: unit.id,
            staffType: 'lecturer',
            employmentStatus: 'active'
        }).returning()

        await db.insert(salaryInfo).values({
            profileId: profile.id,
            salaryGrade: 2,
            salaryCoefficient: '2.67' as any
        })

        jest.spyOn(permissionService, 'getScopes').mockResolvedValue([{ scopeType: 'school', unitId: null }])

        await salaryService.updateSalary(
            profile.id,
            { salary_grade: 3, salary_coefficient: 3.0 },
            {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                unitId: user.unitId
            }
        )

        const [scope] = await db
            .select()
            .from(resourceScopes)
            .where(
                and(
                    eq(resourceScopes.resourceType, 'salary'),
                    eq(resourceScopes.resourceId, profile.id)
                )
            )
            .limit(1)

        expect(scope).toBeDefined()
        expect(scope.ownerId).toBe(user.id)
        expect(scope.unitId).toBe(unit.id)
    })

    it('registers salary scope when workflow changes are applied', async () => {
        jest.spyOn(emailService, 'sendSalaryApprovalEmail').mockResolvedValue(undefined as never)

        const [unit] = await db.insert(organizationalUnits).values({
            name: 'Workflow Unit',
            code: 'WF_UNIT',
            unitType: 'faculty'
        }).returning()

        const [user] = await db.insert(users).values({
            username: 'salary_workflow_user',
            email: 'salary_workflow_user@example.com',
            fullName: 'Salary Workflow User',
            passwordHash: 'hash',
            isActive: true,
            unitId: unit.id
        }).returning()

        const [profile] = await db.insert(profileStaff).values({
            userId: user.id,
            unitId: unit.id,
            staffType: 'lecturer',
            employmentStatus: 'active'
        }).returning()

        await db.insert(salaryInfo).values({
            profileId: profile.id,
            salaryGrade: 1,
            salaryCoefficient: '2.34' as any
        })

        const [proposal] = await db.insert(salaryUpgradeProposals).values({
            profileId: profile.id,
            proposedGrade: 4,
            proposedCoefficient: '3.99' as any,
            proposedNextDate: '2026-01-01' as any,
            status: 'pending'
        }).returning()

        await salaryService.applyChangesFromWorkflow(
            {
                id: 999,
                definitionId: 1,
                resourceType: 'salary_upgrade',
                resourceId: proposal.id,
                initiatedBy: user.id,
                currentStep: 1,
                status: 'approved',
                metadata: {}
            } as any,
            user.id
        )

        const [scope] = await db
            .select()
            .from(resourceScopes)
            .where(
                and(
                    eq(resourceScopes.resourceType, 'salary'),
                    eq(resourceScopes.resourceId, profile.id)
                )
            )
            .limit(1)

        expect(scope).toBeDefined()
        expect(scope.ownerId).toBe(user.id)
        expect(scope.unitId).toBe(unit.id)
    })
})
