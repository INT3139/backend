import { Router } from "express"
import * as controller from "./profile.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./profile.schema"

const router = Router()

// Tất cả routes đều yêu cầu authentication
router.use(authenticate)

/**
 * @openapi
 * /profiles/me:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/me", controller.getMyProfile)

/**
 * @openapi
 * /profiles/search:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Search profiles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/search", controller.searchProfiles)

/**
 * @openapi
 * /profiles:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get all profiles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", requirePermission(PERM.PROFILE.READ), controller.getProfiles)

/**
 * @openapi
 * /profiles/{id}:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get profile by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id", requirePermission(PERM.PROFILE.READ), controller.getProfileById)

/**
 * @openapi
 * /profiles:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Create new profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProfile'
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
    "/", 
    requirePermission(PERM.PROFILE.WRITE), 
    validateBody(schema.createProfileSchema),
    controller.createProfile
)

/**
 * @openapi
 * /profiles/{id}:
 *   put:
 *     tags:
 *       - Profile
 *     summary: Update profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfile'
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
    "/:id", 
    requirePermission(PERM.PROFILE.WRITE), 
    validateBody(schema.updateProfileSchema),
    controller.updateProfile
)

/**
 * @openapi
 * /profiles/{id}:
 *   delete:
 *     tags:
 *       - Profile
 *     summary: Delete profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.delete("/:id", requirePermission(PERM.PROFILE.DELETE), controller.deleteProfile)

/**
 * @openapi
 * /profiles/{id}/approve:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Approve profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/:id/approve", requirePermission(PERM.PROFILE.APPROVE), controller.approveProfile)

/**
 * @openapi
 * /profiles/{id}/reject:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Reject profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/:id/reject", requirePermission(PERM.PROFILE.REJECT), controller.rejectProfile)

import * as subSchema from "./profileSub.schema"

/**
 * @openapi
 * /profiles/{id}/status:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Change employment status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.patch(
    "/:id/status", 
    requirePermission(PERM.PROFILE.STATUS), 
    validateBody(schema.changeStatusSchema),
    controller.changeStatus
)

// --- SUB-MODULES ---

/**
 * @openapi
 * /profiles/{id}/education:
 *   get:
 *     tags:
 *       - Profile Education
 *     summary: Get education history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id/education", requirePermission(PERM.PROFILE.READ), controller.getEducation)

/**
 * @openapi
 * /profiles/{id}/education:
 *   post:
 *     tags:
 *       - Profile Education
 *     summary: Add education record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - edu_type
 *             properties:
 *               edu_type:
 *                 type: string
 *                 enum: [degree, certificate, foreign_lang, it]
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/:id/education", requirePermission(PERM.PROFILE.WRITE), validateBody(subSchema.educationSchema), controller.createEducation)

/**
 * @openapi
 * /profiles/{id}/education/{subId}:
 *   delete:
 *     tags:
 *       - Profile Education
 *     summary: Delete education record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.delete("/:id/education/:subId", requirePermission(PERM.PROFILE.WRITE), controller.deleteEducation)

// Family
/**
 * @openapi
 * /profiles/{id}/family:
 *   get:
 *     tags:
 *       - Profile Family
 *     summary: Get family relations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id/family", requirePermission(PERM.PROFILE.READ), controller.getFamily)

/**
 * @openapi
 * /profiles/{id}/family:
 *   post:
 *     tags:
 *       - Profile Family
 *     summary: Add family record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - side
 *               - relationship
 *               - full_name
 *             properties:
 *               side:
 *                 type: string
 *                 enum: [self, spouse]
 *               relationship:
 *                 type: string
 *               full_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/:id/family", requirePermission(PERM.PROFILE.WRITE), validateBody(subSchema.familySchema), controller.createFamily)

/**
 * @openapi
 * /profiles/{id}/family/{subId}:
 *   delete:
 *     tags:
 *       - Profile Family
 *     summary: Delete family record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.delete("/:id/family/:subId", requirePermission(PERM.PROFILE.WRITE), controller.deleteFamily)

// Work History
/**
 * @openapi
 * /profiles/{id}/work-history:
 *   get:
 *     tags:
 *       - Profile Work History
 *     summary: Get work history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id/work-history", requirePermission(PERM.PROFILE.READ), controller.getWorkHistory)

/**
 * @openapi
 * /profiles/{id}/work-history:
 *   post:
 *     tags:
 *       - Profile Work History
 *     summary: Add work history record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - history_type
 *               - unit_name
 *             properties:
 *               history_type:
 *                 type: string
 *                 enum: [chinh_quyen, dang, cong_doan, doan, quan_ngu_chinh_tri]
 *               unit_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/:id/work-history", requirePermission(PERM.PROFILE.WRITE), validateBody(subSchema.workHistorySchema), controller.createWorkHistory)

/**
 * @openapi
 * /profiles/{id}/work-history/{subId}:
 *   delete:
 *     tags:
 *       - Profile Work History
 *     summary: Delete work history record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.delete("/:id/work-history/:subId", requirePermission(PERM.PROFILE.WRITE), controller.deleteWorkHistory)

// Extra Info
/**
 * @openapi
 * /profiles/{id}/extra:
 *   get:
 *     tags:
 *       - Profile Extra
 *     summary: Get extra info
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id/extra", requirePermission(PERM.PROFILE.READ), controller.getExtraInfo)

/**
 * @openapi
 * /profiles/{id}/extra:
 *   put:
 *     tags:
 *       - Profile Extra
 *     summary: Update extra info
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               income_salary:
 *                 type: number
 *     responses:
 *       200:
 *         description: Success
 */
router.put("/:id/extra", requirePermission(PERM.PROFILE.WRITE), validateBody(subSchema.extraInfoSchema), controller.updateExtraInfo)

// Health Records
/**
 * @openapi
 * /profiles/{id}/health:
 *   get:
 *     tags:
 *       - Profile Health
 *     summary: Get health records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id/health", requirePermission(PERM.PROFILE.READ), controller.getHealthRecords)

/**
 * @openapi
 * /profiles/{id}/health:
 *   put:
 *     tags:
 *       - Profile Health
 *     summary: Update health records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               health_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put("/:id/health", requirePermission(PERM.PROFILE.WRITE), validateBody(subSchema.healthSchema), controller.updateHealthRecords)

export const profileRoutes = router
