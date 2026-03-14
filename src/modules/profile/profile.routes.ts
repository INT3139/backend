import { Router } from "express"
import * as controller from "./profile.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { requireResource, requireSelfOrPermission } from "@/core/middlewares/requireResource"
import { profileService } from "./profile.service"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./profile.schema"

const router = Router()

router.use(authenticate)

const getOwner = async (req: any) => (await profileService.getProfileById(+req.params.id))?.userId ?? 0

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
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
    "/:id",
    requireSelfOrPermission(PERM.PROFILE.READ, 'profile', r => +r.params.id, getOwner),
    controller.getProfileById
)

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
 *           type: integer
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
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
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
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.delete(
    "/:id",
    requireResource(PERM.PROFILE.DELETE, 'profile', r => +r.params.id),
    controller.deleteProfile
)

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
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.post(
    "/:id/approve",
    requireResource(PERM.PROFILE.APPROVE, 'profile', r => +r.params.id),
    controller.approveProfile
)

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
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.post(
    "/:id/reject",
    requireResource(PERM.PROFILE.REJECT, 'profile', r => +r.params.id),
    controller.rejectProfile
)

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
 *           type: integer
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
    requireResource(PERM.PROFILE.STATUS, 'profile', r => +r.params.id),
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
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
    "/:id/education",
    requireSelfOrPermission(PERM.PROFILE.READ, 'profile', r => +r.params.id, getOwner),
    controller.getEducation
)

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
 *           type: integer
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
router.post(
    "/:id/education",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(subSchema.educationSchema),
    controller.createEducation
)

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
 *           type: integer
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.delete(
    "/:id/education/:subId",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    controller.deleteEducation
)

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
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
    "/:id/family",
    requireSelfOrPermission(PERM.PROFILE.READ, 'profile', r => +r.params.id, getOwner),
    controller.getFamily
)

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
 *           type: integer
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
router.post(
    "/:id/family",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(subSchema.familySchema),
    controller.createFamily
)

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
 *           type: integer
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.delete(
    "/:id/family/:subId",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    controller.deleteFamily
)

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
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
    "/:id/work-history",
    requireSelfOrPermission(PERM.PROFILE.READ, 'profile', r => +r.params.id, getOwner),
    controller.getWorkHistory
)

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
 *           type: integer
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
router.post(
    "/:id/work-history",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(subSchema.workHistorySchema),
    controller.createWorkHistory
)

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
 *           type: integer
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.delete(
    "/:id/work-history/:subId",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    controller.deleteWorkHistory
)

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
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
    "/:id/extra",
    requireSelfOrPermission(PERM.PROFILE.READ, 'profile', r => +r.params.id, getOwner),
    controller.getExtraInfo
)

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
 *           type: integer
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
router.put(
    "/:id/extra",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(subSchema.extraInfoSchema),
    controller.updateExtraInfo
)

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
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
    "/:id/health",
    requireSelfOrPermission(PERM.PROFILE.READ, 'profile', r => +r.params.id, getOwner),
    controller.getHealthRecords
)

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
 *           type: integer
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
router.put(
    "/:id/health",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(subSchema.healthSchema),
    controller.updateHealthRecords
)

export const profileRoutes: Router = router
