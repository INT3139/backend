import { Router } from "express"
import * as controller from "./reward.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./reward.schema"
import multer from "multer"

/**
 * @openapi
 * components:
 *   schemas:
 *     Commendation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         profileId:
 *           type: integer
 *         awardLevel:
 *           type: string
 *           enum: [co_so, dhqg, bo, chinh_phu, nha_nuoc]
 *         awardName:
 *           type: string
 *         decisionNumber:
 *           type: string
 *         decisionDate:
 *           type: string
 *           format: date
 *         academicYear:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     RewardTitle:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         profileId:
 *           type: integer
 *         titleName:
 *           type: string
 *         titleLevel:
 *           type: string
 *           enum: [unit, university, ministry]
 *         awardedYear:
 *           type: string
 *         decisionNumber:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Discipline:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         profileId:
 *           type: integer
 *         disciplineType:
 *           type: string
 *         reason:
 *           type: string
 *         decisionNumber:
 *           type: string
 *         unitName:
 *           type: string
 *         issuedDate:
 *           type: string
 *           format: date
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

// Tất cả routes đều yêu cầu authentication
router.use(authenticate)

/**
 * @openapi
 * /reward/me:
 *   get:
 *     tags:
 *       - Reward
 *     summary: Get current user's rewards
 *     description: Retrieve all commendations, titles, and disciplinary records for the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user rewards
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         commendations:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Commendation'
 *                         titles:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/RewardTitle'
 *                         discipline:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Discipline'
 */
router.get("/me", requirePermission(PERM.REWARD.SELF_READ), controller.getMyRewards)

/**
 * @openapi
 * /reward/commendations:
 *   get:
 *     tags:
 *       - Reward Commendations
 *     summary: Get all commendations
 *     description: Retrieve a paginated list of commendations for all staff.
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
 *         name: academicYear
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved commendations
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Commendation'
 */
router.get("/commendations", requirePermission(PERM.REWARD.READ), controller.getCommendations)

/**
 * @openapi
 * /reward/commendations:
 *   post:
 *     tags:
 *       - Reward Commendations
 *     summary: Create commendation
 *     description: Record a new commendation for a staff member.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profileId
 *               - awardLevel
 *               - awardName
 *             properties:
 *               profileId:
 *                 type: integer
 *               awardLevel:
 *                 type: string
 *                 enum: [co_so, dhqg, bo, chinh_phu, nha_nuoc]
 *               awardName:
 *                 type: string
 *               decisionNumber:
 *                 type: string
 *               decisionDate:
 *                 type: string
 *                 format: date
 *               academicYear:
 *                 type: string
 *     responses:
 *       201:
 *         description: Commendation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Commendation'
 */
router.post(
    "/commendations",
    requirePermission(PERM.REWARD.WRITE),
    validateBody(schema.createCommendationSchema),
    controller.createCommendation
)

/**
 * @openapi
 * /reward/commendations/{id}:
 *   put:
 *     tags:
 *       - Reward Commendations
 *     summary: Update commendation
 *     description: Update an existing commendation record.
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
 *               awardName:
 *                 type: string
 *               awardLevel:
 *                 type: string
 *               decisionNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Commendation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Commendation'
 */
router.put(
    "/commendations/:id",
    requirePermission(PERM.REWARD.WRITE),
    validateBody(schema.updateCommendationSchema),
    controller.updateCommendation
)

/**
 * @openapi
 * /reward/commendations/{id}:
 *   delete:
 *     tags:
 *       - Reward Commendations
 *     summary: Delete commendation
 *     description: Remove a commendation record from the system.
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
 *         description: Commendation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete("/commendations/:id", requirePermission(PERM.REWARD.WRITE), controller.deleteCommendation)

/**
 * @openapi
 * /reward/commendations/{id}/attachments:
 *   post:
 *     tags:
 *       - Reward Commendations
 *     summary: Upload attachment for commendation
 *     description: Upload a supporting document for a commendation record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
 */
router.post(
    "/commendations/:id/attachments",
    requirePermission(PERM.ATTACHMENT.UPLOAD),
    upload.single("file"),
    controller.uploadCommendationAttachment
)

/**
 * @openapi
 * /reward/titles:
 *   get:
 *     tags:
 *       - Reward Titles
 *     summary: Get all titles
 *     description: Retrieve a paginated list of staff titles and honorary awards.
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
 *         description: Successfully retrieved titles
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RewardTitle'
 */
router.get("/titles", requirePermission(PERM.REWARD.READ), controller.getTitles)

/**
 * @openapi
 * /reward/titles:
 *   post:
 *     tags:
 *       - Reward Titles
 *     summary: Create title
 *     description: Record a new title or honorary award for a staff member.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profileId
 *               - titleName
 *               - titleLevel
 *               - awardedYear
 *             properties:
 *               profileId:
 *                 type: integer
 *               titleName:
 *                 type: string
 *               titleLevel:
 *                 type: string
 *                 enum: [unit, university, ministry]
 *               awardedYear:
 *                 type: string
 *               decisionNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Title created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/RewardTitle'
 */
router.post(
    "/titles",
    requirePermission(PERM.REWARD.WRITE),
    validateBody(schema.createTitleSchema),
    controller.createTitle
)

/**
 * @openapi
 * /reward/discipline:
 *   get:
 *     tags:
 *       - Reward Discipline
 *     summary: Get all disciplinary records
 *     description: Retrieve a paginated list of disciplinary records for all staff.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved disciplinary records
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Discipline'
 */
router.get("/discipline", requirePermission(PERM.REWARD.DISCIPLINE), controller.getDisciplinaryRecords)

/**
 * @openapi
 * /reward/discipline:
 *   post:
 *     tags:
 *       - Reward Discipline
 *     summary: Create disciplinary record
 *     description: Record a new disciplinary action for a staff member.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profileId
 *               - disciplineType
 *               - reason
 *               - decisionNumber
 *               - unitName
 *               - issuedDate
 *             properties:
 *               profileId:
 *                 type: integer
 *               disciplineType:
 *                 type: string
 *               reason:
 *                 type: string
 *               decisionNumber:
 *                 type: string
 *               unitName:
 *                 type: string
 *               issuedDate:
 *                 type: string
 *                 format: date
 */
router.post(
    "/discipline",
    requirePermission(PERM.REWARD.DISCIPLINE),
    validateBody(schema.createDisciplineSchema),
    controller.createDiscipline
)

/**
 * @openapi
 * /reward/discipline/{id}:
 *   put:
 *     tags:
 *       - Reward Discipline
 *     summary: Update disciplinary record
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
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
    "/discipline/:id",
    requirePermission(PERM.REWARD.DISCIPLINE),
    validateBody(schema.updateDisciplineSchema),
    controller.updateDiscipline
)

/**
 * @openapi
 * /reward/discipline/{id}:
 *   delete:
 *     tags:
 *       - Reward Discipline
 *     summary: Delete disciplinary record
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
router.delete("/discipline/:id", requirePermission(PERM.REWARD.DISCIPLINE), controller.deleteDiscipline)

/**
 * @openapi
 * /reward/discipline/{id}/attachments:
 *   post:
 *     tags:
 *       - Reward Discipline
 *     summary: Upload attachment for disciplinary record
 */
router.post(
    "/discipline/:id/attachments",
    requirePermission(PERM.ATTACHMENT.UPLOAD),
    upload.single("file"),
    controller.uploadDisciplineAttachment
)

/**
 * @openapi
 * /reward/discipline/{id}/attachments:
 *   get:
 *     tags:
 *       - Reward Discipline
 *     summary: List attachments for disciplinary record
 */
router.get(
    "/discipline/:id/attachments",
    requirePermission(PERM.REWARD.DISCIPLINE),
    controller.listDisciplineAttachments
)

router.get("/export", requirePermission(PERM.REWARD.EXPORT), controller.exportRewards)

export const rewardRoutes: Router = router
