import { Router } from "express"
import * as controller from "./workload.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { requireResource } from "@/core/middlewares/requireResource"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./workload.schema"

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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/me", requirePermission(PERM.WORKLOAD.SELF_READ), controller.getMyWorkload)

/**
 * @openapi
 * /workload/evidences:
 *   post:
 *     tags:
 *       - Workload Evidence
 *     summary: Create workload evidence
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - academic_year
 *               - evidence_type
 *               - title
 *             properties:
 *               academic_year:
 *                 type: string
 *               evidence_type:
 *                 type: string
 *                 enum: [teaching, research_paper, research_project, other_task]
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/evidences", requirePermission(PERM.WORKLOAD.READ), controller.getEvidences)

/**
 * @openapi
 * /workload/evidences/{id}/approve:
 *   post:
 *     tags:
 *       - Workload Evidence
 *     summary: Approve workload evidence
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
 *               - reject_reason
 *             properties:
 *               reject_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/summaries", requirePermission(PERM.WORKLOAD.READ), controller.getSummaries)

export const workloadRoutes: Router = router
