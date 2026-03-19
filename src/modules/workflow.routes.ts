import { Router, Request, Response, NextFunction } from 'express'
import { workflowEngine } from '@/core/workflow/engine'
import { ballotService } from '@/core/workflow/ballot.service'
import { dispatchWorkflowResult } from '@/core/workflow/workflow.dispatcher'
import { requirePermission } from '@/core/middlewares/requirePermission'
import { ValidationError, ForbiddenError } from '@/core/middlewares/errorHandler'
import { ID } from '@/types'
import { PERM } from "@/constants/permission"
import { authenticate } from '@/core/middlewares/auth'

const router = Router()
router.use(authenticate)

/**
 * @openapi
 * /workflow/tasks:
 *   get:
 *     tags:
 *       - Workflow
 *     summary: Get pending tasks for current user
 *     description: Retrieve all pending workflow tasks assigned to the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved pending tasks
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get(
    '/tasks',
    requirePermission(PERM.WORKFLOW.READ),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tasks = await workflowEngine.getMyTasks(req.userId as ID)
            res.json({ data: tasks })
        } catch (e) { next(e) }
    },
)

/**
 * @openapi
 * /workflow/{id}:
 *   get:
 *     tags:
 *       - Workflow
 *     summary: Get workflow status
 *     description: Retrieve the current status and history of a specific workflow instance.
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
 *         description: Successfully retrieved workflow instance
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 */
router.get(
    '/:id',
    requirePermission(PERM.WORKFLOW.READ),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const instance = await workflowEngine.getStatus(+req.params.id)
            res.json({ data: instance })
        } catch (e) { next(e) }
    },
)

/**
 * @openapi
 * /workflow/{id}/advance:
 *   post:
 *     tags:
 *       - Workflow
 *     summary: Advance workflow
 *     description: Submit a decision to advance a workflow instance to its next state.
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
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject, request_revision, forward]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Workflow advanced successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 */
router.post(
    '/:id/advance',
    requirePermission(PERM.WORKFLOW.ADVANCE),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { action, comment } = req.body

            const VALID_ACTIONS = ['approve', 'reject', 'request_revision', 'forward']
            if (!action || !VALID_ACTIONS.includes(action)) {
                throw new ValidationError(`action phải là một trong: ${VALID_ACTIONS.join(', ')}`)
            }

            const instance = await workflowEngine.advance(
                +req.params.id,
                req.userId as ID,
                action,
                comment,
            )

            res.json({ data: instance })
        } catch (e) { next(e) }
    },
)

/**
 * @openapi
 * /workflow/{id}/cancel:
 *   post:
 *     tags:
 *       - Workflow
 *     summary: Cancel workflow
 *     description: Cancel an active workflow instance.
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Workflow cancelled successfully
 */
router.post(
    '/:id/cancel',
    requirePermission(PERM.WORKFLOW.ADVANCE),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { reason } = req.body
            if (!reason?.trim()) throw new ValidationError('reason là bắt buộc')

            await workflowEngine.cancel(+req.params.id, req.userId as ID, reason)
            res.json({ message: 'Đã huỷ workflow' })
        } catch (e) { next(e) }
    },
)

/**
 * @openapi
 * /workflow/{id}/metadata:
 *   patch:
 *     tags:
 *       - Workflow
 *     summary: Update workflow metadata
 *     description: Update the metadata of a workflow instance before it is finalized.
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
 *               - metadata
 *             properties:
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Metadata updated successfully
 */
router.patch(
    '/:id/metadata',
    requirePermission(PERM.WORKFLOW.ADVANCE),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { metadata } = req.body
            if (!metadata || typeof metadata !== 'object') {
                throw new ValidationError('metadata phải là object')
            }

            await workflowEngine.updateMetadata(+req.params.id, metadata)
            res.json({ message: 'Đã cập nhật metadata' })
        } catch (e) { next(e) }
    },
)

export const workflowRoutes: Router = router