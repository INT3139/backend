import request from 'supertest'
import { createApp } from '@/app'
import { db } from '@/configs/db'
import { users, profileStaff, organizationalUnits, salaryInfo } from '@/db/schema'
import { issueTokenPair } from '@/core/auth/jwt'
import { TestDbHelper } from '../helpers/testHelpers'
import { grantPermission } from '../helpers/permHelpers'
import { PERM } from '@/constants/permission'
import { abacService } from '@/core/permissions/abac'

const app = createApp()

describe('Salary Integration Tests', () => {
    let authToken: string
    let testUser: any
    let testUnit: any
    let testProfile: any

    beforeEach(async () => {
        await TestDbHelper.clearAllTables()

        // Setup test environment
        const [unit] = await db.insert(organizationalUnits).values({
            name: 'Test Unit',
            code: 'TUNIT',
            unitType: 'faculty'
        }).returning()
        testUnit = unit

        const [user] = await db.insert(users).values({
            username: 'salaryuser',
            email: 'salary@example.com',
            fullName: 'Salary User',
            passwordHash: 'hash',
            isActive: true,
            unitId: testUnit.id
        }).returning()
        testUser = user

        const [profile] = await db.insert(profileStaff).values({
            userId: testUser.id,
            unitId: testUnit.id,
            staffType: 'lecturer',
            employmentStatus: 'active'
        }).returning()
        testProfile = profile

        const { accessToken } = issueTokenPair({
            id: testUser.id,
            username: testUser.username,
            email: testUser.email,
            fullName: testUser.fullName,
            unitId: testUser.unitId
        })
        authToken = accessToken
    })

    describe('GET /api/v1/salary/me', () => {
        it('should return 403 if user lacks permission', async () => {
            const res = await request(app)
                .get('/api/v1/salary/me')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.status).toBe(403)
        })

        it('should return salary info if user has permission', async () => {
            await grantPermission(testUser.id, PERM.SALARY.SELF_READ)
            
            await db.insert(salaryInfo).values({
                profileId: testProfile.id,
                salaryGrade: 1,
                salaryCoefficient: '2.34' as any
            })

            // Mock resource scope
            await abacService.registerScope({
                resourceType: 'salary',
                resourceId: testProfile.id,
                ownerId: testUser.id,
                unitId: testUnit.id
            })

            const res = await request(app)
                .get('/api/v1/salary/me')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data.salaryGrade).toBe(1)
        })
    })

    describe('PUT /api/v1/salary/info/:profileId', () => {
        it('should update salary info if user has permission', async () => {
            await grantPermission(testUser.id, PERM.SALARY.WRITE)
            
            await db.insert(salaryInfo).values({
                profileId: testProfile.id,
                salaryGrade: 1,
                salaryCoefficient: '2.34' as any
            })

            // Mock resource scope
            await abacService.registerScope({
                resourceType: 'salary',
                resourceId: testProfile.id,
                ownerId: testUser.id,
                unitId: testUnit.id
            })

            const res = await request(app)
                .put(`/api/v1/salary/info/${testProfile.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    salary_grade: 2,
                    salary_coefficient: 2.67
                })

            expect(res.status).toBe(200)
            expect(res.body.data.salaryGrade).toBe(2)
        })
    })
})
