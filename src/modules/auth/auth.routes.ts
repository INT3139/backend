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
 *         - port
 *       properties:
 *         username:
 *           type: string
 *           example: hungpn
 *         password:
 *           type: string
 *           example: "123456"
 *         port:
 *           type: string
 *           enum: [admin, cv, main]
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
 *             role:
 *               type: string
 *             port:
 *               type: string
 *             activeRoles:
 *               type: array
 *               items:
 *                 type: string
 *     RefreshTokenResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/LoginResponse/properties/user'
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
 *             properties:
 *               scopeType:
 *                 type: string
 *               unitId:
 *                 type: integer
 *                 nullable: true
 */

const router = Router()

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng nhập hệ thống
 *     description: Xác thực người dùng bằng username, password và port (admin, cv, main).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Sai thông tin đăng nhập
 *       403:
 *         description: Không có quyền truy cập cổng này
 *       500:
 *         description: Lỗi hệ thống
 */
router.post("/login", validateBody(schema.loginSchema), controller.loginCtrl)

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Làm mới access token
 *     description: Sử dụng refresh token để lấy access token mới và thông tin user context.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Refresh thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/RefreshTokenResponse'
 *       401:
 *         description: Refresh token không hợp lệ hoặc hết hạn
 */
router.post("/refresh", validateBody(schema.refreshSchema), controller.refreshTokenCtrl)

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng xuất
 *     description: Hủy phiên làm việc hiện tại.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
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
 *     summary: Đổi mật khẩu
 *     description: Cập nhật mật khẩu mới cho user đang đăng nhập.
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
 *         description: Đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc mật khẩu cũ sai
 */
router.post("/change-password", authenticate, validateBody(schema.changePasswordSchema), controller.changePasswordCtrl)

/**
 * @openapi
 * /auth/permissions:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Lấy danh sách quyền và scope
 *     description: Trả về toàn bộ permissions và các scopes tương ứng dựa trên cổng (port) đang truy cập.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy dữ liệu thành công
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