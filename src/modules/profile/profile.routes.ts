import { Router } from "express"
import * as controller from "./profile.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { requireResource, requireSelfOrPermission } from "@/core/middlewares/requireResource"
import { profileService } from "./profile.service"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./profile.schema"

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateProfile:
 *       type: object
 *       required:
 *         - userId
 *         - unitId
 *       properties:
 *         userId:
 *           type: integer
 *         unitId:
 *           type: integer
 *         emailVnu:
 *           type: string
 *           format: email
 *         emailPersonal:
 *           type: string
 *           format: email
 *         phoneWork:
 *           type: string
 *         phoneHome:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [Nam, Nữ, Khác]
 *         idNumber:
 *           type: string
 *         idIssuedDate:
 *           type: string
 *           format: date
 *         idIssuedBy:
 *           type: string
 *         nationality:
 *           type: string
 *           default: Việt Nam
 *         ethnicity:
 *           type: string
 *         religion:
 *           type: string
 *         maritalStatus:
 *           type: string
 *           enum: [single, married, divorced, widowed]
 *         policyObject:
 *           type: string
 *         nickName:
 *           type: string
 *         passportNumber:
 *           type: string
 *         passportIssuedAt:
 *           type: string
 *           format: date
 *         passportIssuedBy:
 *           type: string
 *         insuranceNumber:
 *           type: string
 *         insuranceJoinedAt:
 *           type: string
 *           format: date
 *         addrHometown:
 *           type: object
 *         addrBirthplace:
 *           type: object
 *         addrPermanent:
 *           type: object
 *         addrCurrent:
 *           type: object
 *         academicDegree:
 *           type: string
 *           enum: [bachelor, master, phd]
 *         academicTitle:
 *           type: string
 *           enum: [gs, pgs]
 *         eduLevelGeneral:
 *           type: string
 *         stateManagement:
 *           type: string
 *         politicalTheory:
 *           type: string
 *           enum: [sơ cấp, trung cấp, cao cấp, cử nhân]
 *         foreignLangLevel:
 *           type: string
 *         itLevel:
 *           type: string
 *         staffType:
 *           type: string
 *         employmentStatus:
 *           type: string
 *           enum: [active, retired, resigned, transferred]
 *         joinDate:
 *           type: string
 *           format: date
 *         retireDate:
 *           type: string
 *           format: date
 *         profileStatus:
 *           type: string
 *           default: draft
 *     UpdateProfile:
 *       $ref: '#/components/schemas/CreateProfile'
 *     Education:
 *       type: object
 *       required:
 *         - eduType
 *       properties:
 *         eduType:
 *           type: string
 *           enum: [degree, certificate, foreign_lang, it]
 *         fromDate:
 *           type: string
 *           format: date
 *         toDate:
 *           type: string
 *           format: date
 *         degreeLevel:
 *           type: string
 *         institution:
 *           type: string
 *         major:
 *           type: string
 *         trainingForm:
 *           type: string
 *         field:
 *           type: string
 *         isStudying:
 *           type: boolean
 *         certName:
 *           type: string
 *         langName:
 *           type: string
 *         langLevel:
 *           type: string
 *           enum: [A1, A2, B1, B2, C1, C2]
 *     Family:
 *       type: object
 *       required:
 *         - side
 *         - relationship
 *         - fullName
 *       properties:
 *         side:
 *           type: string
 *           enum: [self, spouse]
 *         relationship:
 *           type: string
 *         fullName:
 *           type: string
 *         birthYear:
 *           type: integer
 *         description:
 *           type: string
 *         status:
 *           type: string
 *     WorkHistory:
 *       type: object
 *       required:
 *         - historyType
 *         - unitName
 *       properties:
 *         historyType:
 *           type: string
 *           enum: [chinh_quyen, dang, cong_doan, doan, quan_ngu_chinh_tri]
 *         fromDate:
 *           type: string
 *           format: date
 *         toDate:
 *           type: string
 *           format: date
 *         unitName:
 *           type: string
 *         positionName:
 *           type: string
 *         activityType:
 *           type: string
 *         status:
 *           type: string
 *     ExtraInfo:
 *       type: object
 *       properties:
 *         arrestHistory:
 *           type: string
 *         oldRegimeWork:
 *           type: string
 *         foreignOrgRelations:
 *           type: string
 *         foreignRelatives:
 *           type: string
 *         incomeSalary:
 *           type: number
 *         incomeOtherSources:
 *           type: number
 *         houseTypeGranted:
 *           type: string
 *         houseAreaGranted:
 *           type: number
 *         houseTypeOwned:
 *           type: string
 *         houseAreaOwned:
 *           type: number
 *         landGrantedM2:
 *           type: number
 *         landPurchasedM2:
 *           type: number
 *         landBusinessM2:
 *           type: number
 *     HealthRecord:
 *       type: object
 *       properties:
 *         healthStatus:
 *           type: string
 *         weightKg:
 *           type: number
 *         heightCm:
 *           type: number
 *         bloodType:
 *           type: string
 *         notes:
 *           type: string
 *     Position:
 *       type: object
 *       required:
 *         - positionName
 *       properties:
 *         unitId:
 *           type: integer
 *         positionName:
 *           type: string
 *         positionType:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         decisionRef:
 *           type: string
 *         isPrimary:
 *           type: boolean
 *     ResearchWork:
 *       type: object
 *       required:
 *         - workType
 *         - title
 *       properties:
 *         workType:
 *           type: string
 *         title:
 *           type: string
 *         journalName:
 *           type: string
 *         indexing:
 *           type: string
 *         publishYear:
 *           type: integer
 *         doi:
 *           type: string
 *         academicYear:
 *           type: string
 *         status:
 *           type: string
 */

const router = Router()

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
router.get("/search", requirePermission(PERM.PROFILE.READ), controller.searchProfiles)

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

/**
 * @openapi
 * /profiles/tasks:
 *   get:
 *     tags:
 *       - Profile Workflow
 *     summary: Get pending profile tasks for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/tasks", controller.getMyTasks)

/**
 * @openapi
 * /profiles/tasks/{instanceId}:
 *   post:
 *     tags:
 *       - Profile Workflow
 *     summary: Process a workflow task (approve/reject)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
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
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject, request_revision, forward]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/tasks/:instanceId", controller.processTask)

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
 *             $ref: '#/components/schemas/Education'
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
 *   put:
 *     tags:
 *       - Profile Education
 *     summary: Update education record
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Education'
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
    "/:id/education/:subId",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(subSchema.educationSchema.partial()),
    controller.updateEducation
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
 *             $ref: '#/components/schemas/Family'
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
 *   put:
 *     tags:
 *       - Profile Family
 *     summary: Update family record
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Family'
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
    "/:id/family/:subId",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(subSchema.familySchema.partial()),
    controller.updateFamily
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
 *             $ref: '#/components/schemas/WorkHistory'
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
 *   put:
 *     tags:
 *       - Profile Work History
 *     summary: Update work history record
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkHistory'
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
    "/:id/work-history/:subId",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(subSchema.workHistorySchema.partial()),
    controller.updateWorkHistory
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
 *             $ref: '#/components/schemas/ExtraInfo'
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
 *             $ref: '#/components/schemas/HealthRecord'
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

// Positions
/**
 * @openapi
 * /profiles/{id}/positions:
 *   get:
 *     tags:
 *       - Profile Positions
 *     summary: Get position history
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
    "/:id/positions",
    requireSelfOrPermission(PERM.PROFILE.READ, 'profile', r => +r.params.id, getOwner),
    controller.getPositions
)

/**
 * @openapi
 * /profiles/{id}/positions:
 *   post:
 *     tags:
 *       - Profile Positions
 *     summary: Add position record
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
 *             $ref: '#/components/schemas/Position'
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
    "/:id/positions",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(subSchema.positionSchema),
    controller.createPosition
)

/**
 * @openapi
 * /profiles/{id}/positions/{subId}:
 *   put:
 *     tags:
 *       - Profile Positions
 *     summary: Update position record
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Position'
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
    "/:id/positions/:subId",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(subSchema.positionSchema.partial()),
    controller.updatePosition
)

/**
 * @openapi
 * /profiles/{id}/positions/{subId}:
 *   delete:
 *     tags:
 *       - Profile Positions
 *     summary: Delete position record
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
    "/:id/positions/:subId",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    controller.deletePosition
)

// Research Works
/**
 * @openapi
 * /profiles/{id}/research-works:
 *   get:
 *     tags:
 *       - Profile Research Works
 *     summary: Get research works
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
    "/:id/research-works",
    requireSelfOrPermission(PERM.PROFILE.READ, 'profile', r => +r.params.id, getOwner),
    controller.getResearchWorks
)

/**
 * @openapi
 * /profiles/{id}/research-works:
 *   post:
 *     tags:
 *       - Profile Research Works
 *     summary: Add research work
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
 *             $ref: '#/components/schemas/ResearchWork'
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
    "/:id/research-works",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(subSchema.researchWorkSchema),
    controller.createResearchWork
)

/**
 * @openapi
 * /profiles/{id}/research-works/{subId}:
 *   put:
 *     tags:
 *       - Profile Research Works
 *     summary: Update research work
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResearchWork'
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
    "/:id/research-works/:subId",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(subSchema.researchWorkSchema.partial()),
    controller.updateResearchWork
)

/**
 * @openapi
 * /profiles/{id}/research-works/{subId}:
 *   delete:
 *     tags:
 *       - Profile Research Works
 *     summary: Delete research work
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
    "/:id/research-works/:subId",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    controller.deleteResearchWork
)

export const profileRoutes: Router = router