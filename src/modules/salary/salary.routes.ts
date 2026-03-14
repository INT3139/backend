import { Router } from "express"
import * as controller from "./salary.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { requireResource, requireSelfOrPermission } from "@/core/middlewares/requireResource"
import { profileService } from "../profile/profile.service"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./salary.schema"

const router = Router()

// Tất cả routes đều yêu cầu authentication
router.use(authenticate)

const getOwner = async (req: any) => (await profileService.getProfileById(+req.params.profileId))?.userId ?? 0

/**
 * @openapi
 * /salary/me:
 *   get:
 *     tags:
 *       - Salary
 *     summary: Get current user's salary info
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/me", requirePermission(PERM.SALARY.SELF_READ), controller.getMySalary)

/**
 * @openapi
 * /salary/info/{profileId}:
 *   get:
 *     tags:
 *       - Salary
 *     summary: Get salary info by profile ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
    "/info/:profileId",
    requireSelfOrPermission(PERM.SALARY.READ, 'salary', r => +r.params.profileId, getOwner),
    controller.getSalaryByProfileId
)

/**
 * @openapi
 * /salary/info/{profileId}:
 *   put:
 *     tags:
 *       - Salary
 *     summary: Update salary info
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
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
 *               salary_grade:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
    "/info/:profileId",
    requireResource(PERM.SALARY.WRITE, 'salary', r => +r.params.profileId),
    validateBody(schema.updateSalarySchema),
    controller.updateSalary
)

/**
 * @openapi
 * /salary/proposals:
 *   get:
 *     tags:
 *       - Salary Proposals
 *     summary: Get salary upgrade proposals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/proposals", requirePermission(PERM.SALARY.READ), controller.getProposals)

/**
 * @openapi
 * /salary/proposals:
 *   post:
 *     tags:
 *       - Salary Proposals
 *     summary: Create salary upgrade proposal
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
 *               - proposed_grade
 *               - proposed_coefficient
 *               - proposed_next_date
 *             properties:
 *               profile_id:
 *                 type: integer
 *               proposed_grade:
 *                 type: integer
 *               proposed_coefficient:
 *                 type: number
 *               proposed_next_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
    "/proposals",
    requirePermission(PERM.SALARY.PROPOSE),
    validateBody(schema.createSalaryProposalSchema),
    controller.createProposal
)

/**
 * @openapi
 * /salary/proposals/{id}/approve:
 *   post:
 *     tags:
 *       - Salary Proposals
 *     summary: Approve salary upgrade proposal
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
router.post("/proposals/:id/approve", requirePermission(PERM.SALARY.APPROVE), controller.approveProposal)

export const salaryRoutes: Router = router

