import { Router } from "express"
import * as controller from "./recruitment.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./recruitment.schema"

const router = Router()

// Tất cả routes đều yêu cầu authentication
router.use(authenticate)

/**
 * @openapi
 * /recruitment/proposals:
 *   get:
 *     tags:
 *       - Recruitment
 *     summary: Get recruitment proposals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/proposals", requirePermission(PERM.RECRUITMENT.READ), controller.getProposals)

/**
 * @openapi
 * /recruitment/proposals/{id}:
 *   get:
 *     tags:
 *       - Recruitment
 *     summary: Get proposal by ID
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
router.get("/proposals/:id", requirePermission(PERM.RECRUITMENT.READ), controller.getProposalById)

/**
 * @openapi
 * /recruitment/proposals:
 *   post:
 *     tags:
 *       - Recruitment
 *     summary: Create recruitment proposal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proposing_unit
 *               - position_name
 *               - academic_year
 *             properties:
 *               proposing_unit:
 *                 type: string
 *                 format: uuid
 *               position_name:
 *                 type: string
 *               academic_year:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
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
 *               position_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
    "/proposals/:id", 
    requirePermission(PERM.RECRUITMENT.WRITE), 
    validateBody(schema.updateProposalSchema),
    controller.updateProposal
)

/**
 * @openapi
 * /recruitment/proposals/{id}/approve:
 *   post:
 *     tags:
 *       - Recruitment
 *     summary: Approve recruitment proposal
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
router.post("/proposals/:id/approve", requirePermission(PERM.RECRUITMENT.APPROVE), controller.approveProposal)

// --- CANDIDATE ROUTES ---

/**
 * @openapi
 * /recruitment/proposals/{id}/candidates:
 *   get:
 *     tags:
 *       - Recruitment Candidates
 *     summary: Get candidates for proposal
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
router.get("/proposals/:id/candidates", requirePermission(PERM.RECRUITMENT.READ), controller.getCandidates)

/**
 * @openapi
 * /recruitment/candidates:
 *   post:
 *     tags:
 *       - Recruitment Candidates
 *     summary: Create recruitment candidate
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proposal_id
 *               - full_name
 *             properties:
 *               proposal_id:
 *                 type: string
 *                 format: uuid
 *               full_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
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
 *               full_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
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
router.delete("/candidates/:id", requirePermission(PERM.RECRUITMENT.WRITE), controller.deleteCandidate)

export const recruitmentRoutes = router
