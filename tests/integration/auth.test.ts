import request from 'supertest'
import { createApp } from '@/app'
import { db } from '@/configs/db'
import { users, roles, userRoles } from '@/db/schema'
import { hashPassword } from '@/utils/hash'
import { TestDbHelper } from '../helpers/testHelpers'

const app = createApp()

describe('Auth Integration Tests', () => {
    beforeEach(async () => {
        await TestDbHelper.clearAllTables()
    })

    describe('POST /api/v1/auth/login', () => {
        it('should login successfully with correct credentials and return role', async () => {
            // Seed a role and a user
            const [role] = await db.insert(roles).values({
                code: 'admin',
                name: 'Administrator'
            }).returning()

            const password = 'Password123!'
            const hashedPassword = await hashPassword(password)
            
            const [user] = await db.insert(users).values({
                username: 'testuser',
                email: 'test@example.com',
                fullName: 'Test User',
                passwordHash: hashedPassword,
                isActive: true
            }).returning()

            await db.insert(userRoles).values({
                userId: user.id,
                roleId: role.id
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
            expect(res.body.data.user.role).toBe('admin')
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

    describe('POST /api/v1/auth/refresh', () => {
        it('should refresh token successfully and return user with role', async () => {
            // Seed a role and a user
            const [role] = await db.insert(roles).values({
                code: 'lecturer',
                name: 'Lecturer'
            }).returning()

            const password = 'Password123!'
            const hashedPassword = await hashPassword(password)

            const [user] = await db.insert(users).values({
                username: 'lecturer1',
                email: 'lecturer@example.com',
                fullName: 'Lecturer User',
                passwordHash: hashedPassword,
                isActive: true
            }).returning()

            await db.insert(userRoles).values({
                userId: user.id,
                roleId: role.id
            })

            // Login to get a refresh token
            const resLogin = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'lecturer1',
                    password: password
                })
            
            const refreshToken = resLogin.body.data.refreshToken

            // Refresh token
            const resRefresh = await request(app)
                .post('/api/v1/auth/refresh')
                .send({
                    token: refreshToken
                })

            expect(resRefresh.status).toBe(200)
            expect(resRefresh.body.success).toBe(true)
            expect(resRefresh.body.data).toHaveProperty('accessToken')
            expect(resRefresh.body.data).toHaveProperty('refreshToken')
            expect(resRefresh.body.data.user.username).toBe('lecturer1')
            expect(resRefresh.body.data.user.role).toBe('lecturer')
        })
    })
})
