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
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *     ApiError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             code:
 *               type: string
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             totalPages:
 *               type: integer
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
 *         avatarUrl:
 *           type: string
 *           format: uri
 *         avatarDefault:
 *           type: boolean
 *           default: true
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

router.use(authenticate)

const getOwner = async (req: any) => (await profileService.getProfileById(+req.params.id))?.userId ?? 0

/**
 * @openapi
 * /profiles/me:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get current user profile
 *     description: Retrieve the detailed profile information for the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved current user profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/CreateProfile'
 *                         - type: object
 *                           properties:
 *                             rewards:
 *                               type: object
 *                               nullable: true
 *                             salary:
 *                               type: object
 *                               nullable: true
 *                             recruitment:
 *                               type: object
 *                               nullable: true
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get("/me", requirePermission(PERM.PROFILE.READ), controller.getMyProfile)

/**
 * @openapi
 * /profiles/me/export:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Export current user profile to 2C/TCTW curriculum vitae (Word format)
 *     description: |
 *       Generates and downloads a Word document (.docx) for the authenticated user's profile.
 *       The document follows the official 2C/TCTW curriculum vitae template used in Vietnam public sectors.
 *       Includes personal info, addresses, education history, work history, family relations, salary info, and rewards.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully generated 2C curriculum vitae document.
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - Token missing or invalid.
 *       404:
 *         description: Profile not found for the current user.
 *       500:
 *         description: Internal server error during document generation.
 */
router.get("/me/export", requirePermission(PERM.PROFILE.READ), controller.exportMyProfile)

/**
 * @openapi
 * /profiles/search:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Search profiles
 *     description: Search for staff profiles based on a query string. Requires PROFILE.READ permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (name, email, or staff ID)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Successfully retrieved search results
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CreateProfile'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - Missing required permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get("/search", requirePermission(PERM.PROFILE.READ), controller.searchProfiles)

/**
 * @openapi
 * /profiles:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get all profiles
 *     description: Retrieve a paginated list of all staff profiles. Requires PROFILE.READ permission.
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
 *     responses:
 *       200:
 *         description: Successfully retrieved all profiles
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CreateProfile'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get("/", requirePermission(PERM.PROFILE.READ), controller.getProfiles)

router.get("/tasks", requirePermission(PERM.WORKFLOW.READ), controller.getMyTasks)
router.post("/tasks/:instanceId", requirePermission(PERM.WORKFLOW.ADVANCE), controller.processTask)

/**
 * @openapi
 * /profiles/{id}:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get profile by ID
 *     description: Retrieve detailed information of a specific profile by its ID. Users can access their own profile or others if they have PROFILE.READ permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The internal database ID of the profile
 *     responses:
 *       200:
 *         description: Successfully retrieved profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/CreateProfile'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
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
 *     description: Create a new staff profile. Requires PROFILE.WRITE permission.
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
 *         description: Successfully created new profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/CreateProfile'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
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
 *     description: Update an existing staff profile. Users can update their own profile or others if they have PROFILE.WRITE permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfile'
 *     responses:
 *       200:
 *         description: Successfully updated profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/CreateProfile'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
router.put(
    "/:id",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    validateBody(schema.updateProfileSchema),
    controller.updateProfile
)

/**
 * @openapi
 * /profiles/{id}/export:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Export any profile to 2C curriculum vitae (Admin/HR only)
 *     description: |
 *       Generates and downloads a Word document (.docx) for a specific profile by ID.
 *       The document follows the official 2C/TCTW curriculum vitae template.
 *       Requires `PROFILE.EXPORT` permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Internal database ID of the profile to export.
 *     responses:
 *       200:
 *         description: Successfully generated 2C document.
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Missing required permission (hrm.profile.export).
 *       404:
 *         description: Profile not found.
 *       500:
 *         description: Internal server error.
 */
router.get(
    "/:id/export",
    requirePermission(PERM.PROFILE.EXPORT),
    controller.exportProfile
)

/**
 * @openapi
 * /profiles/{id}:
 *   delete:
 *     tags:
 *       - Profile
 *     summary: Delete profile
 *     description: Remove a profile from the system. Requires PROFILE.DELETE permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Successfully deleted profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
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
 *     description: Approve a pending profile or changes. Requires PROFILE.APPROVE permission.
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
 *         description: Successfully approved profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
router.post(
    "/:id/approve",
    requireResource(PERM.PROFILE.APPROVE, 'profile', r => +r.params.id),
    controller.approveProfile
)

import * as subSchema from "./profileSub.schema"

/**
 * @openapi
 * /profiles/{id}/status:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Change employment status
 *     description: Update the employment status (e.g., active, retired) of a staff member. Requires PROFILE.STATUS permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
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
 *                 description: New employment status
 *     responses:
 *       200:
 *         description: Successfully changed status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
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
 *     description: Retrieve all education records for a specific profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Successfully retrieved education history
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Education'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
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
 *     description: Add a new education entry (degree, certificate, etc.) to a profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Education'
 *     responses:
 *       201:
 *         description: Successfully added education record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Education'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
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
 *     description: Update an existing education entry.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Education record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Education'
 *     responses:
 *       200:
 *         description: Successfully updated education record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Education'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
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
 *     description: Remove an education entry from a profile.
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
 *         description: Successfully deleted education record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
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
 *     description: Retrieve all family member records for a specific profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Successfully retrieved family relations
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Family'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
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
 *     description: Add a new family member record to a profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Family'
 *     responses:
 *       201:
 *         description: Successfully added family record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Family'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
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
 *     description: Update an existing family member record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Family record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Family'
 *     responses:
 *       200:
 *         description: Successfully updated family record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Family'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
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
 *     description: Remove a family member record from a profile.
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
 *         description: Successfully deleted family record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
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
 *     description: Retrieve the complete work history for a specific profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Successfully retrieved work history
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WorkHistory'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
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
 *     description: Add a new work history entry to a profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkHistory'
 *     responses:
 *       201:
 *         description: Successfully added work history record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/WorkHistory'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
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
 *     description: Update an existing work history entry.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Work history record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkHistory'
 *     responses:
 *       200:
 *         description: Successfully updated work history record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/WorkHistory'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
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
 *     description: Remove a work history entry from a profile.
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
 *         description: Successfully deleted work history record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
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
 *     description: Retrieve supplementary information for a specific profile, such as arrest history, foreign relations, and property ownership.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Successfully retrieved extra info
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/ExtraInfo'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
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
 *     description: Update the supplementary information for a profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExtraInfo'
 *     responses:
 *       200:
 *         description: Successfully updated extra info
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/ExtraInfo'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
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
 *     description: Retrieve health-related information (e.g., status, height, weight, blood type) for a specific profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Successfully retrieved health records
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/HealthRecord'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
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
 *     description: Update the health-related information for a profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthRecord'
 *     responses:
 *       200:
 *         description: Successfully updated health records
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/HealthRecord'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
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
 *     description: Retrieve the history of all positions and roles held by a staff member.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Successfully retrieved position history
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Position'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
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
 *     description: Add a new position or role record to a profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Position'
 *     responses:
 *       201:
 *         description: Successfully added position record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Position'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
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
 *     description: Update an existing position or role record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Position record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Position'
 *     responses:
 *       200:
 *         description: Successfully updated position record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Position'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
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
 *     description: Remove a position record from a profile.
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
 *         description: Successfully deleted position record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
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
 *     description: |
 *       Retrieve research works, publications, and projects for a specific profile.
 *       Supports filtering by type, pagination, and returns a summary of counts by type.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by work type (e.g., journal_paper, book)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Records per page
 *     responses:
 *       200:
 *         description: Successfully retrieved research works
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ResearchWork'
 *                         summary:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                               count:
 *                                 type: integer
 *                         meta:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             totalPages:
 *                               type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
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
 *     description: Add a new research work or publication record to a profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResearchWork'
 *     responses:
 *       201:
 *         description: Successfully added research work
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/ResearchWork'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
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
 *     description: Update an existing research work or publication record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Research work record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResearchWork'
 *     responses:
 *       200:
 *         description: Successfully updated research work
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/ResearchWork'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
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
 *     description: Remove a research work record from a profile.
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
 *         description: Successfully deleted research work
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/:id/research-works/:subId",
    requireSelfOrPermission(PERM.PROFILE.WRITE, 'profile', r => +r.params.id, getOwner),
    controller.deleteResearchWork
)

export const profileRoutes: Router = router