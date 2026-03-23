import request from 'supertest'
import { createApp } from '@/app'
import { generateToken } from '@/core/auth/jwt'
import { db } from '@/configs/db'
import { users, profileStaff, recruitmentInfo, recruitmentContracts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { PERM } from '@/constants/permission'

describe('Recruitment Info Integration Tests', () => {
    let app: any
    let authToken: string
    let testUser: any
    let testProfile: any

    beforeAll(async () => {
        app = createApp()

        // Create a test user
        const [user] = await db.insert(users).values({
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'hashed_password',
            fullName: 'Test User',
            isActive: true
        }).returning()
        testUser = user

        // Create a test profile
        const [profile] = await db.insert(profileStaff).values({
            userId: testUser.id,
            unitId: 1, // Assume unit 1 exists
            profileStatus: 'approved'
        }).returning()
        testProfile = profile

        // Create recruitment info
        await db.insert(recruitmentInfo).values({
            profileId: testProfile.id,
            notes: 'Test recruitment info'
        })

        // Create recruitment contract
        await db.insert(recruitmentContracts).values({
            profileId: testProfile.id,
            contractType: 'labor_contract',
            startDate: new Date().toISOString().split('T')[0],
            status: 'active'
        })

        authToken = generateToken({ sub: testUser.id, username: testUser.username })
    })

    afterAll(async () => {
        // Cleanup
        await db.delete(recruitmentContracts).where(eq(recruitmentContracts.profileId, testProfile.id))
        await db.delete(recruitmentInfo).where(eq(recruitmentInfo.profileId, testProfile.id))
        await db.delete(profileStaff).where(eq(profileStaff.id, testProfile.id))
        await db.delete(users).where(eq(users.id, testUser.id))
    })

    describe('GET /api/v1/recruitment/me', () => {
        it('should return 403 if user lacks SELF_READ permission', async () => {
            const res = await request(app)
                .get('/api/v1/recruitment/me')
                .set('Authorization', `Bearer ${authToken}`)
            
            // Note: In real app, permissions are handled via DB. 
            // If the test setup doesn't grant permissions, it should be 403.
            expect(res.status).toBe(403)
        })
    })

    describe('GET /api/v1/recruitment/info/:profileId', () => {
        it('should return 403 if user lacks READ permission', async () => {
            const res = await request(app)
                .get(`/api/v1/recruitment/info/${testProfile.id}`)
                .set('Authorization', `Bearer ${authToken}`)
            
            expect(res.status).toBe(403)
        })
    })
})
