import { Router } from "express"
import * as controller from "./admin.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./admin.schema"

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get list of users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/users", requirePermission(PERM.SYSTEM.USER_MANAGE), controller.getUsers)

/**
 * @openapi
 * /admin/users:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create new user
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
 *         description: Created
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
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Success
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
 *         description: Success
 */
router.delete("/users/:id", requirePermission(PERM.SYSTEM.USER_MANAGE), controller.deleteUser)

/**
 * @openapi
 * /admin/users/{id}/roles:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Assign role to user
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
 *               scopeUnitId:
 *                 type: integer
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Success
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: path
 *         name: roleId
 *         required: true
 *     responses:
 *       200:
 *         description: Success
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/roles", requirePermission(PERM.SYSTEM.ROLE_MANAGE), controller.getRoles)

/**
 * @openapi
 * /admin/roles:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create new role
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
 *         description: Created
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/units", requirePermission(PERM.SYSTEM.CONFIG_READ), controller.getUnits)

/**
 * @openapi
 * /admin/units:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create new unit
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
 *         description: Created
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
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
