import request from 'supertest'
import { createApp } from '@/app'
import { db } from '@/configs/db'
import { users, profileStaff, organizationalUnits } from '@/db/schema'
import { issueTokenPair } from '@/core/auth/jwt'
import { TestDbHelper } from '../helpers/testHelpers'
import { grantPermission } from '../helpers/permHelpers'
import { PERM } from '@/constants/permission'

const app = createApp()

describe('Profile Integration Tests', () => {
    let authToken: string
    let testUser: any
    let testUnit: any

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
            username: 'profileuser',
            email: 'profile@example.com',
            fullName: 'Profile User',
            passwordHash: 'hash',
            isActive: true,
            unitId: testUnit.id
        }).returning()
        testUser = user

        const { accessToken } = issueTokenPair({
            id: testUser.id,
            username: testUser.username,
            email: testUser.email,
            fullName: testUser.fullName,
            unitId: testUser.unitId
        })
        authToken = accessToken
    })

    describe('GET /api/v1/profile/me', () => {
        it('should return null if profile does not exist for current user', async () => {
            const res = await request(app)
                .get('/api/v1/profile/me')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeNull()
        })

        it('should return profile if exists', async () => {
            await db.insert(profileStaff).values({
                userId: testUser.id,
                unitId: testUnit.id,
                emailVnu: 'test@vnu.edu.vn',
                staffType: 'lecturer',
                employmentStatus: 'active'
            })

            const res = await request(app)
                .get('/api/v1/profile/me')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data).not.toBeNull()
            expect(res.body.data.userId).toBe(testUser.id)
        })
    })

    describe('POST /api/v1/profile', () => {
        it('should create a new profile if user has permission', async () => {
            await grantPermission(testUser.id, PERM.PROFILE.WRITE)

            const profileData = {
                userId: testUser.id,
                unitId: testUnit.id,
                emailVnu: 'new@vnu.edu.vn',
                gender: 'Nam',
                staffType: 'lecturer'
            }

            const res = await request(app)
                .post('/api/v1/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(profileData)

            expect(res.status).toBe(201)
            expect(res.body.data.emailVnu).toBe(profileData.emailVnu)
        })

        it('should return 403 if user lacks permission', async () => {
            const profileData = {
                userId: testUser.id,
                unitId: testUnit.id,
                emailVnu: 'no-perm@vnu.edu.vn'
            }

            const res = await request(app)
                .post('/api/v1/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(profileData)

            expect(res.status).toBe(403)
        })
    })
})
