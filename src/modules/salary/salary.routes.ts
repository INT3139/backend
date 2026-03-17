import { Router } from "express"
import * as controller from "./salary.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { requireResource, requireSelfOrPermission } from "@/core/middlewares/requireResource"
import { profileService } from "../profile/profile.service"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./salary.schema"

/**
 * @openapi
 * components:
 *   schemas:
 *     SalaryInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         profileId:
 *           type: integer
 *         salaryGrade:
 *           type: integer
 *         salaryCoefficient:
 *           type: number
 *         effectiveDate:
 *           type: string
 *           format: date
 *         nextDate:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SalaryUpgradeProposal:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         profileId:
 *           type: integer
 *         currentGrade:
 *           type: integer
 *         currentCoefficient:
 *           type: number
 *         proposedGrade:
 *           type: integer
 *         proposedCoefficient:
 *           type: number
 *         proposedNextDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

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
 *     description: Retrieve detailed salary information for the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved salary info
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/SalaryInfo'
 */
router.get("/me", requirePermission(PERM.SALARY.SELF_READ), controller.getMySalary)

/**
 * @openapi
 * /salary/info/{profileId}:
 *   get:
 *     tags:
 *       - Salary
 *     summary: Get salary info by profile ID
 *     description: Retrieve salary information for a specific staff profile.
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
 *         description: Successfully retrieved salary info
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/SalaryInfo'
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
 *     description: Directly update the salary information for a staff member. Requires SALARY.WRITE permission.
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
 *               salaryGrade:
 *                 type: integer
 *               salaryCoefficient:
 *                 type: number
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Salary info updated successfully
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
 *     description: Retrieve a paginated list of all salary upgrade proposals.
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
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved proposals
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SalaryUpgradeProposal'
 */
router.get("/proposals", requirePermission(PERM.SALARY.READ), controller.getProposals)

/**
 * @openapi
 * /salary/proposals:
 *   post:
 *     tags:
 *       - Salary Proposals
 *     summary: Create salary upgrade proposal
 *     description: Submit a new proposal to upgrade a staff member's salary grade or coefficient.
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
 *               - proposedGrade
 *               - proposedCoefficient
 *               - proposedNextDate
 *             properties:
 *               profileId:
 *                 type: integer
 *               proposedGrade:
 *                 type: integer
 *               proposedCoefficient:
 *                 type: number
 *               proposedNextDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Proposal created successfully
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
 *     description: Approve a pending salary upgrade proposal.
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
 *         description: Proposal approved successfully
 */
router.post("/proposals/:id/approve", requirePermission(PERM.SALARY.APPROVE), controller.approveProposal)

export const salaryRoutes: Router = router

