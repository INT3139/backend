import request from 'supertest'
import { createApp } from '@/app'
import { db } from '@/configs/db'
import { users } from '@/db/schema'
import { hashPassword } from '@/utils/hash'
import { TestDbHelper } from '../helpers/testHelpers'

const app = createApp()

describe('Auth Integration Tests', () => {
    beforeEach(async () => {
        await TestDbHelper.clearAllTables()
    })

    describe('POST /api/v1/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            // Seed a user
            const password = 'Password123!'
            const hashedPassword = await hashPassword(password)
            
            await db.insert(users).values({
                username: 'testuser',
                email: 'test@example.com',
                fullName: 'Test User',
                passwordHash: hashedPassword,
                isActive: true
            })

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'testuser',
                    password: password
                })

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('accessToken')
            expect(res.body.data).toHaveProperty('refreshToken')
            expect(res.body.data.user.username).toBe('testuser')
        })

        it('should fail with incorrect password', async () => {
            const password = 'Password123!'
            const hashedPassword = await hashPassword(password)
            
            await db.insert(users).values({
                username: 'testuser',
                email: 'test@example.com',
                fullName: 'Test User',
                passwordHash: hashedPassword,
                isActive: true
            })

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'testuser',
                    password: 'wrongpassword'
                })

            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error.message).toBe('Invalid credentials')
        })

        it('should fail with non-existent user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'nonexistent',
                    password: 'anypassword'
                })

            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
        })
    })
})
