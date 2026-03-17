import { Router } from "express"
import * as controller from "./workload.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { requireResource } from "@/core/middlewares/requireResource"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./workload.schema"

/**
 * @openapi
 * components:
 *   schemas:
 *     WorkloadEvidence:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         profileId:
 *           type: integer
 *         academicYear:
 *           type: string
 *         evidenceType:
 *           type: string
 *           enum: [teaching, research_paper, research_project, other_task]
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         reviewedBy:
 *           type: integer
 *         reviewedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *     WorkloadSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         profileId:
 *           type: integer
 *         academicYear:
 *           type: string
 *         teachingHours:
 *           type: number
 *         researchHours:
 *           type: number
 *         otherHours:
 *           type: number
 *         totalHours:
 *           type: number
 *         status:
 *           type: string
 */

const router = Router()

// Tất cả routes đều yêu cầu authentication
router.use(authenticate)

/**
 * @openapi
 * /workload/me:
 *   get:
 *     tags:
 *       - Workload
 *     summary: Get current user's workload info
 *     description: Retrieve teaching, research quotas and annual workload summary for the current user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved workload info
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         quota:
 *                           type: object
 *                         summary:
 *                           $ref: '#/components/schemas/WorkloadSummary'
 *                         evidences:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/WorkloadEvidence'
 */
router.get("/me", requirePermission(PERM.WORKLOAD.SELF_READ), controller.getMyWorkload)

/**
 * @openapi
 * /workload/evidences:
 *   post:
 *     tags:
 *       - Workload Evidence
 *     summary: Create workload evidence
 *     description: Submit a new evidence for workload verification (teaching, research, etc.).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - academicYear
 *               - evidenceType
 *               - title
 *             properties:
 *               academicYear:
 *                 type: string
 *               evidenceType:
 *                 type: string
 *                 enum: [teaching, research_paper, research_project, other_task]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               hours:
 *                 type: number
 *     responses:
 *       201:
 *         description: Evidence created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/WorkloadEvidence'
 */
router.post(
    "/evidences",
    requirePermission(PERM.WORKLOAD.WRITE),
    validateBody(schema.createEvidenceSchema),
    controller.createEvidence
)

/**
 * @openapi
 * /workload/evidences:
 *   get:
 *     tags:
 *       - Workload Evidence
 *     summary: Get workload evidences for review
 *     description: Retrieve a paginated list of evidences submitted for review. Requires WORKLOAD.READ.
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
 *         description: Successfully retrieved evidences
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WorkloadEvidence'
 */
router.get("/evidences", requirePermission(PERM.WORKLOAD.READ), controller.getEvidences)

/**
 * @openapi
 * /workload/evidences/{id}/approve:
 *   post:
 *     tags:
 *       - Workload Evidence
 *     summary: Approve workload evidence
 *     description: Approve a submitted workload evidence.
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
 *         description: Evidence approved successfully
 */
router.post(
    "/evidences/:id/approve",
    requireResource(PERM.WORKLOAD.APPROVE, 'workload_evidence', r => +r.params.id),
    controller.approveEvidence
)

/**
 * @openapi
 * /workload/evidences/{id}/reject:
 *   post:
 *     tags:
 *       - Workload Evidence
 *     summary: Reject workload evidence
 *     description: Reject a submitted workload evidence with a reason.
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
 *               - rejectReason
 *             properties:
 *               rejectReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evidence rejected successfully
 */
router.post(
    "/evidences/:id/reject",
    requireResource(PERM.WORKLOAD.APPROVE, 'workload_evidence', r => +r.params.id),
    validateBody(schema.rejectEvidenceSchema),
    controller.rejectEvidence
)

/**
 * @openapi
 * /workload/summaries:
 *   get:
 *     tags:
 *       - Workload
 *     summary: Get workload summaries
 *     description: Retrieve annual workload summaries for all staff in allowed units.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved summaries
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WorkloadSummary'
 */
router.get("/summaries", requirePermission(PERM.WORKLOAD.READ), controller.getSummaries)

export const workloadRoutes: Router = router
