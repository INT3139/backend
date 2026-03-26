import { Router, Request, Response, NextFunction } from 'express'
import { workflowEngine } from '@/core/workflow/engine'
import { ballotService } from '@/core/workflow/ballot.service'
import { dispatchWorkflowResult } from '@/core/workflow/workflow.dispatcher'
import { requirePermission } from '@/core/middlewares/requirePermission'
import { ValidationError, ForbiddenError } from '@/core/middlewares/errorHandler'
import { ID } from '@/types'
import { PERM } from "@/constants/permission"
import { authenticate } from '@/core/middlewares/auth'
import { profileService } from '@/modules/profile/profile.service'
import { db } from '@/configs/db'
import { wfStepLogs } from '@/db/schema/workflow'

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
/**
 * @openapi
 * /workflow/{id}/{key}:
 *   patch:
 *     tags:
 *       - Workflow
 *     summary: Process a specific metadata item
 *     description: Approve or reject a specific item in the workflow metadata. If approved, it applies changes to DB and advances the workflow.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: key
 *         required: true
 *         description: The metadata key to process (e.g., 'main', 'sub_family_61')
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *                 description: True to apply and advance, false to just remove from metadata
 *               action:
 *                 type: string
 *                 enum: [approve, reject, request_revision, forward]
 *                 default: approve
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item processed successfully
 */
router.patch(
    '/:id/:key',
    requirePermission(PERM.WORKFLOW.ADVANCE),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id: instanceId, key } = req.params as { id: string, key: string }
            const { approved, action, comment } = req.body
            const actorId = req.userId as ID

            if (typeof approved !== 'boolean') {
                throw new ValidationError('approved (boolean) là bắt buộc')
            }

            // 1. Lấy trạng thái hiện tại của workflow
            const inst = await workflowEngine.getStatus(+instanceId)
            const metadata = inst.metadata || {}

            if (!metadata[key]) {
                throw new ValidationError(`Không tìm thấy mục "${key}" trong metadata của workflow này`)
            }

            // 2. Xử lý logic phê duyệt/áp dụng nếu approved = true
            if (approved && inst.resourceType === 'profile') {
                // Tạo mock instance chỉ chứa duy nhất key này để apply vào DB
                const mockInst = {
                    ...inst,
                    metadata: { [key]: metadata[key] },
                    status: 'approved'
                } as any
                await profileService.applyChangesFromWorkflow(mockInst, actorId)
            }

            // 3. Cập nhật lại Metadata của Workflow (Xóa mục đã xử lý)
            const newMetadata = { ...metadata }
            delete newMetadata[key]
            await workflowEngine.updateMetadata(+instanceId, newMetadata)

            // 4. Quyết định chuyển trạng thái (Advance) hay chỉ ghi log
            if (approved) {
                // Chuyển bước quy trình (giống /advance)
                const updatedInst = await workflowEngine.advance(
                    +instanceId,
                    actorId,
                    action || 'approve',
                    comment || `Phê duyệt mục: ${key}`
                )
                res.json({
                    message: `Đã phê duyệt mục "${key}" và chuyển bước quy trình thành công.`,
                    data: updatedInst,
                    remainingItems: Object.keys(newMetadata).length
                })
            } else {
                // Chỉ xóa khỏi metadata và ghi log, không chuyển bước (stay at current step)
                await db.insert(wfStepLogs).values({
                    instanceId: +instanceId,
                    stepNumber: inst.currentStep,
                    stepName: `Loại bỏ mục: ${key}`,
                    actorId,
                    action: 'forward',
                    comment: comment || `Admin đã loại bỏ mục "${key}" khỏi danh sách phê duyệt`,
                })
                res.json({
                    message: `Đã loại bỏ mục "${key}" khỏi danh sách chờ. Quy trình giữ nguyên bước hiện tại.`,
                    remainingItems: Object.keys(newMetadata).length
                })
            }
        } catch (e) { next(e) }
    },
)

export const workflowRoutes: Router = router