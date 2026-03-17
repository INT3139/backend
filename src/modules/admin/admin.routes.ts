import { Router } from "express"
import * as controller from "./admin.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./admin.schema"

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         fullName:
 *           type: string
 *         unitId:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *     Unit:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         unit_type:
 *           type: string
 *           enum: [school, faculty, department, lab]
 *         parent_id:
 *           type: integer
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         eventType:
 *           type: string
 *         resourceType:
 *           type: string
 *         resourceId:
 *           type: string
 *         eventTime:
 *           type: string
 *           format: date-time
 *         clientIp:
 *           type: string
 *         details:
 *           type: object
 */

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get list of users
 *     description: Retrieve a paginated list of all users in the system. Requires USER_MANAGE permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of users
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 */
router.get("/users", requirePermission(PERM.SYSTEM.USER_MANAGE), controller.getUsers)

/**
 * @openapi
 * /admin/users:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create new user
 *     description: Create a new system user with specified roles and unit assignment.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - fullName
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *               password:
 *                 type: string
 *               unitId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 */
router.post(
    "/users",
    requirePermission(PERM.SYSTEM.USER_MANAGE),
    validateBody(schema.createUserSchema),
    controller.createUser
)

/**
 * @openapi
 * /admin/users/{id}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update user
 *     description: Update existing user information such as full name or active status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               unitId:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 */
router.put(
    "/users/:id",
    requirePermission(PERM.SYSTEM.USER_MANAGE),
    validateBody(schema.updateUserSchema),
    controller.updateUser
)

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete user
 *     description: Soft delete a user from the system.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete("/users/:id", requirePermission(PERM.SYSTEM.USER_MANAGE), controller.deleteUser)

/**
 * @openapi
 * /admin/users/{id}/roles:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Assign role to user
 *     description: Grant a specific role to a user with optional scope and expiration date.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: integer
 *               scopeType:
 *                 type: string
 *                 enum: [school, faculty, department, self]
 *                 default: school
 *               scopeUnitId:
 *                 type: integer
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post(
    "/users/:id/roles",
    requirePermission(PERM.SYSTEM.ROLE_GRANT),
    validateBody(schema.assignRoleSchema),
    controller.assignRole
)

/**
 * @openapi
 * /admin/users/{id}/roles/{roleId}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Revoke role from user
 *     description: Remove a previously assigned role from a user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete(
    "/users/:id/roles/:roleId",
    requirePermission(PERM.SYSTEM.ROLE_GRANT),
    controller.revokeRole
)

/**
 * @openapi
 * /admin/roles:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all roles
 *     description: Retrieve a list of all available roles in the system.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved roles
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Role'
 */
router.get("/roles", requirePermission(PERM.SYSTEM.ROLE_MANAGE), controller.getRoles)

/**
 * @openapi
 * /admin/roles:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create new role
 *     description: Define a new role with a unique code and name.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Role'
 */
router.post(
    "/roles",
    requirePermission(PERM.SYSTEM.ROLE_MANAGE),
    validateBody(schema.createRoleSchema),
    controller.createRole
)

/**
 * @openapi
 * /admin/units:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all units
 *     description: Retrieve a list of all organizational units (faculties, departments, etc.).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved units
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Unit'
 */
router.get("/units", requirePermission(PERM.SYSTEM.CONFIG_READ), controller.getUnits)

/**
 * @openapi
 * /admin/units:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create new unit
 *     description: Add a new organizational unit to the system hierarchy.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - unit_type
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               unit_type:
 *                 type: string
 *                 enum: [school, faculty, department, lab]
 *               parent_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Unit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Unit'
 */
router.post(
    "/units",
    requirePermission(PERM.SYSTEM.CONFIG_WRITE),
    validateBody(schema.createUnitSchema),
    controller.createUnit
)

/**
 * @openapi
 * /admin/audit-logs:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get audit logs
 *     description: Retrieve a paginated list of system audit logs for security and tracking.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Successfully retrieved audit logs
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuditLog'
 */
router.get("/audit-logs", requirePermission(PERM.SYSTEM.AUDIT_READ), controller.getAuditLogs)

/**
 * @openapi
 * /admin/workflows/{id}/metadata:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update pending workflow metadata (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Success
 */
router.put("/workflows/:id/metadata", requirePermission(PERM.SYSTEM.USER_MANAGE), controller.updateWorkflowMetadata)

export const adminRoutes: Router = router
