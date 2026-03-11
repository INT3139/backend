import { Router } from "express"
import * as controller from "./reward.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./reward.schema"

const router = Router()

// Tất cả routes đều yêu cầu authentication
router.use(authenticate)

/**
 * @openapi
 * /reward/me:
 *   get:
 *     tags:
 *       - Reward
 *     summary: Get current user's rewards
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/me", requirePermission(PERM.REWARD.SELF_READ), controller.getMyRewards)

/**
 * @openapi
 * /reward/commendations:
 *   get:
 *     tags:
 *       - Reward Commendations
 *     summary: Get all commendations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/commendations", requirePermission(PERM.REWARD.READ), controller.getCommendations)

/**
 * @openapi
 * /reward/commendations:
 *   post:
 *     tags:
 *       - Reward Commendations
 *     summary: Create commendation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profile_id
 *               - award_level
 *               - award_name
 *             properties:
 *               profile_id:
 *                 type: string
 *                 format: uuid
 *               award_level:
 *                 type: string
 *                 enum: [co_so, dhqg, bo, chinh_phu, nha_nuoc]
 *               award_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
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
 *               award_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
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
router.delete("/commendations/:id", requirePermission(PERM.REWARD.WRITE), controller.deleteCommendation)

/**
 * @openapi
 * /reward/titles:
 *   get:
 *     tags:
 *       - Reward Titles
 *     summary: Get all titles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/titles", requirePermission(PERM.REWARD.READ), controller.getTitles)

/**
 * @openapi
 * /reward/titles:
 *   post:
 *     tags:
 *       - Reward Titles
 *     summary: Create title
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profile_id
 *               - title_name
 *               - title_level
 *               - awarded_year
 *             properties:
 *               profile_id:
 *                 type: string
 *                 format: uuid
 *               title_name:
 *                 type: string
 *               title_level:
 *                 type: string
 *                 enum: [unit, university, ministry]
 *               awarded_year:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
    "/titles", 
    requirePermission(PERM.REWARD.WRITE), 
    validateBody(schema.createTitleSchema),
    controller.createTitle
)

/**
 * @openapi
 * /reward/titles/{id}:
 *   put:
 *     tags:
 *       - Reward Titles
 *     summary: Update title
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
 *               title_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
    "/titles/:id", 
    requirePermission(PERM.REWARD.WRITE), 
    validateBody(schema.updateTitleSchema),
    controller.updateTitle
)

/**
 * @openapi
 * /reward/titles/{id}:
 *   delete:
 *     tags:
 *       - Reward Titles
 *     summary: Delete title
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
router.delete("/titles/:id", requirePermission(PERM.REWARD.WRITE), controller.deleteTitle)

/**
 * @openapi
 * /reward/discipline:
 *   get:
 *     tags:
 *       - Reward Discipline
 *     summary: Get all disciplinary records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/discipline", requirePermission(PERM.REWARD.DISCIPLINE), controller.getDisciplinaryRecords)

/**
 * @openapi
 * /reward/discipline:
 *   post:
 *     tags:
 *       - Reward Discipline
 *     summary: Create disciplinary record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profile_id
 *               - discipline_type
 *               - reason
 *               - decision_number
 *               - unit_name
 *               - issued_date
 *             properties:
 *               profile_id:
 *                 type: string
 *                 format: uuid
 *               discipline_type:
 *                 type: string
 *               reason:
 *                 type: string
 *               decision_number:
 *                 type: string
 *               unit_name:
 *                 type: string
 *               issued_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Created
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
 *           type: string
 *           format: uuid
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
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 */
router.delete("/discipline/:id", requirePermission(PERM.REWARD.DISCIPLINE), controller.deleteDiscipline)

export const rewardRoutes = router
