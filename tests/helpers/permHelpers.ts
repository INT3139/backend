import { db } from "@/configs/db"
import { roles, permissions, rolePermissions, userRoles } from "@/db/schema"
import { ID } from "@/types"
import { permissionService } from "@/core/permissions/permission.service"
import { eq } from "drizzle-orm"

/**
 * Grant a specific permission to a user for testing
 */
export async function grantPermission(userId: ID, permissionCode: string): Promise<void> {
    // 1. Ensure permission exists
    await db.insert(permissions).values({
        code: permissionCode,
        description: 'Test permission',
        isActive: true
    }).onConflictDoNothing()

    // 2. Create a test role
    const [role] = await db.insert(roles).values({
        code: `test_role_${permissionCode}`,
        name: 'Test Role'
    }).onConflictDoNothing().returning()

    let finalRoleId: number
    if (role) {
        finalRoleId = role.id
    } else {
        const existing = await db.select().from(roles).where(eq(roles.code, `test_role_${permissionCode}`)).limit(1)
        finalRoleId = existing[0].id
    }

    // 3. Map permission to role
    await db.insert(rolePermissions).values({
        roleId: finalRoleId,
        permissionCode: permissionCode
    }).onConflictDoNothing()

    // 4. Assign role to user
    await db.insert(userRoles).values({
        userId: userId,
        roleId: finalRoleId,
        grantedBy: userId,
        scopeType: 'school'
    }).onConflictDoNothing()

    // 5. Invalidate cache
    await permissionService.invalidate(userId)
}
