import { Router } from "express"
import * as controller from "./recruitment.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { requireResource, requireSelfOrPermission } from "@/core/middlewares/requireResource"
import { recruitmentService } from "./recruitment.service"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./recruitment.schema"

/**
 * @openapi
 * components:
 *   schemas:
 *     RecruitmentProposal:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         proposingUnit:
 *           type: integer
 *         positionName:
 *           type: string
 *         academicYear:
 *           type: string
 *         quantity:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [draft, pending, approved, rejected]
 *         reason:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     RecruitmentCandidate:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         proposalId:
 *           type: integer
 *         fullName:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         gender:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [applied, interviewing, offered, hired, rejected]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const router = Router()

// Tất cả routes đều yêu cầu authentication
router.use(authenticate)

const getOwner = async (req: any) => (await recruitmentService.getProposalById(+req.params.id))?.createdBy ?? 0

/**
 * @openapi
 * /recruitment/proposals:
 *   get:
 *     tags:
 *       - Recruitment
 *     summary: Get recruitment proposals
 *     description: Retrieve a paginated list of recruitment proposals, optionally filtered by unit or status.
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
 *         name: unitId
 *         schema:
 *           type: integer
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
 *                         $ref: '#/components/schemas/RecruitmentProposal'
 */
router.get("/proposals", requirePermission(PERM.RECRUITMENT.READ), controller.getProposals)

/**
 * @openapi
 * /recruitment/proposals/{id}:
 *   get:
 *     tags:
 *       - Recruitment
 *     summary: Get proposal by ID
 *     description: Retrieve detailed information about a specific recruitment proposal.
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
 *         description: Successfully retrieved proposal
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/RecruitmentProposal'
 */
router.get(
    "/proposals/:id",
    requireSelfOrPermission(PERM.RECRUITMENT.READ, 'recruitment_proposal', r => +r.params.id, getOwner),
    controller.getProposalById
)

/**
 * @openapi
 * /recruitment/proposals:
 *   post:
 *     tags:
 *       - Recruitment
 *     summary: Create recruitment proposal
 *     description: Submit a new recruitment proposal for approval.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proposingUnit
 *               - positionName
 *               - academicYear
 *             properties:
 *               proposingUnit:
 *                 type: integer
 *               positionName:
 *                 type: string
 *               academicYear:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proposal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/RecruitmentProposal'
 */
router.post(
    "/proposals",
    requirePermission(PERM.RECRUITMENT.WRITE),
    validateBody(schema.createProposalSchema),
    controller.createProposal
)

/**
 * @openapi
 * /recruitment/proposals/{id}:
 *   put:
 *     tags:
 *       - Recruitment
 *     summary: Update recruitment proposal
 *     description: Modify an existing recruitment proposal. Only allowed for creators or managers.
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
 *               positionName:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proposal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/RecruitmentProposal'
 */
router.put(
    "/proposals/:id",
    requireSelfOrPermission(PERM.RECRUITMENT.WRITE, 'recruitment_proposal', r => +r.params.id, getOwner),
    validateBody(schema.updateProposalSchema),
    controller.updateProposal
)

/**
 * @openapi
 * /recruitment/tasks:
 *   get:
 *     tags:
 *       - Recruitment
 *     summary: Get pending recruitment workflow tasks for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved pending tasks
 */
router.get("/tasks", requirePermission(PERM.WORKFLOW.READ), controller.getMyTasks)

/**
 * @openapi
 * /recruitment/tasks/{instanceId}:
 *   post:
 *     tags:
 *       - Recruitment
 *     summary: Process a recruitment workflow task
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
 *         description: Task processed successfully
 */
router.post("/tasks/:instanceId", requirePermission(PERM.WORKFLOW.ADVANCE), controller.processTask)

// --- CANDIDATE ROUTES ---

/**
 * @openapi
 * /recruitment/proposals/{id}/candidates:
 *   get:
 *     tags:
 *       - Recruitment Candidates
 *     summary: Get candidates for proposal
 *     description: Retrieve all candidates associated with a specific recruitment proposal.
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
 *         description: Successfully retrieved candidates
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RecruitmentCandidate'
 */
router.get(
    "/proposals/:id/candidates",
    requireSelfOrPermission(PERM.RECRUITMENT.READ, 'recruitment_proposal', r => +r.params.id, getOwner),
    controller.getCandidates
)

/**
 * @openapi
 * /recruitment/candidates:
 *   post:
 *     tags:
 *       - Recruitment Candidates
 *     summary: Create recruitment candidate
 *     description: Add a new candidate to a recruitment proposal.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proposalId
 *               - fullName
 *             properties:
 *               proposalId:
 *                 type: integer
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Candidate added successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/RecruitmentCandidate'
 */
router.post(
    "/candidates",
    requirePermission(PERM.RECRUITMENT.WRITE),
    validateBody(schema.createCandidateSchema),
    controller.createCandidate
)

/**
 * @openapi
 * /recruitment/candidates/{id}:
 *   put:
 *     tags:
 *       - Recruitment Candidates
 *     summary: Update recruitment candidate
 *     description: Update candidate information or recruitment status.
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
 *               fullName:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [applied, interviewing, offered, hired, rejected]
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/RecruitmentCandidate'
 */
router.put(
    "/candidates/:id",
    requirePermission(PERM.RECRUITMENT.WRITE),
    validateBody(schema.updateCandidateSchema),
    controller.updateCandidate
)

/**
 * @openapi
 * /recruitment/candidates/{id}:
 *   delete:
 *     tags:
 *       - Recruitment Candidates
 *     summary: Delete recruitment candidate
 *     description: Remove a candidate from the system.
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
 *         description: Candidate deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete("/candidates/:id", requirePermission(PERM.RECRUITMENT.WRITE), controller.deleteCandidate)

export const recruitmentRoutes: Router = router
