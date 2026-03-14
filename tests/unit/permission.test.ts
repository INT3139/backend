import { permissionService } from '@/core/permissions/permission.service'
import { db } from '@/configs/db'
import { users, roles, permissions, rolePermissions, userRoles } from '@/db/schema'
import { TestDbHelper } from '../helpers/testHelpers'

describe('PermissionService Unit Tests', () => {
    beforeEach(async () => {
        await TestDbHelper.clearAllTables()
    })

    it('should load permissions for user correctly', async () => {
        // Seed
        const [user] = await db.insert(users).values({
            username: 'permuser',
            email: 'perm@example.com',
            fullName: 'Perm User',
            passwordHash: 'hash'
        }).returning()

        const [role] = await db.insert(roles).values({
            code: 'test_role',
            name: 'Test Role'
        }).returning()

        await db.insert(permissions).values({
            code: 'test.perm',
            description: 'Test Permission',
            isActive: true
        })

        await db.insert(rolePermissions).values({
            roleId: role.id,
            permissionCode: 'test.perm'
        })

        await db.insert(userRoles).values({
            userId: user.id,
            roleId: role.id,
            grantedBy: user.id,
            scopeType: 'school'
        })

        await permissionService.loadForUser(user.id)
        
        const hasPerm = await permissionService.hasPermission(user.id, 'test.perm')
        expect(hasPerm).toBe(true)

        const scopes = await permissionService.getScopes(user.id)
        expect(scopes).toHaveLength(1)
        expect(scopes[0].scopeType).toBe('school')
    })
})
