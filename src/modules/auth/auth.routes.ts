import { Router } from "express"
import * as controller from "./auth.controller"
import { validateBody } from "@/utils/validate"
import * as schema from "./auth.schema"
import { authenticate } from "@/core/middlewares/auth"

/**
 * @openapi
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *     LoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             username:
 *               type: string
 *             fullName:
 *               type: string
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - oldPassword
 *         - newPassword
 *       properties:
 *         oldPassword:
 *           type: string
 *         newPassword:
 *           type: string
 *     PermissionInfo:
 *       type: object
 *       properties:
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         scopes:
 *           type: array
 *           items:
 *             type: object
 */

const router = Router()

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     description: Authenticate user with username and password to receive JWT tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post("/login", validateBody(schema.loginSchema), controller.loginCtrl)

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh token
 *     description: Obtain a new access token using a valid refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", validateBody(schema.refreshSchema), controller.refreshTokenCtrl)

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user
 *     description: Invalidate the current session/tokens.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post("/logout", authenticate, controller.logoutCtrl)

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Change password
 *     description: Update password for the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid input or old password incorrect
 */
router.post("/change-password", authenticate, validateBody(schema.changePasswordSchema), controller.changePasswordCtrl)

/**
 * @openapi
 * /auth/permissions:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get user permissions and scopes
 *     description: Retrieve all assigned permissions and their respective scopes for the current user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved permissions
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/PermissionInfo'
 */
router.get("/permissions", authenticate, controller.getPermissionsCtrl)

export const authRoutes: Router = router;