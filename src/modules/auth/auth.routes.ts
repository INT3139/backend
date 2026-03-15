import { Router } from "express"
import * as controller from "./auth.controller"
import { validateBody } from "@/utils/validate"
import * as schema from "./auth.schema"
import { authenticate } from "@/core/middlewares/auth"

const router = Router()

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/login", validateBody(schema.loginSchema), controller.loginCtrl)

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/refresh", validateBody(schema.refreshSchema), controller.refreshTokenCtrl)

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/logout", authenticate, controller.logoutCtrl)

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Change password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/change-password", authenticate, validateBody(schema.changePasswordSchema), controller.changePasswordCtrl)

/**
 * @openapi
 * /auth/permissions:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get user permissions and scopes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/permissions", authenticate, controller.getPermissionsCtrl)

export const authRoutes: Router = router;