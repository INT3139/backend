import { Router, Request, Response, NextFunction } from 'express'
import { workflowEngine } from '@/core/workflow/engine'
import { ballotService } from '@/core/workflow/ballot.service'
import { dispatchWorkflowResult, dispatchWorkflowPartialApproval } from '@/core/workflow/workflow.dispatcher'
import { requirePermission } from '@/core/middlewares/requirePermission'
import { ValidationError, ForbiddenError } from '@/core/middlewares/errorHandler'
import { ID } from '@/types'
import { PERM } from "@/constants/permission"
import { authenticate } from '@/core/middlewares/auth'
import { profileService } from '@/modules/profile/profile.service'
import { profileRepo } from '@/modules/profile/profile.repo'
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

            const VALID_ACTIONS = ['approve', 'ballot_submit', 'reject', 'request_revision', 'forward']
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

            // Trong cấu trúc phẳng, item chưa xử lý là item không có trường 'status'
            const itemData = metadata[key]
            if (!itemData || (itemData as any).status) {
                throw new ValidationError(`Mục "${key}" không tồn tại hoặc đã được xử lý trước đó.`)
            }

            // 2. DEFERRED PROCESSING: Track approval/rejection in metadata directly
            // Mark as approved or rejected without applying to DB yet. 
            // Changes applied only when finalize or all processed.
            if (inst.resourceType === 'profile' || inst.resourceType === 'salary_upgrade') {
                if (inst.resourceType === 'profile') {
                    await profileRepo.movePendingToProcessed(+instanceId, key, approved ? 'approved' : 'rejected', actorId)
                    
                    // Nếu bị từ chối lẻ, ta cần đưa bản ghi con trong DB quay lại trạng thái 'approved'
                    if (!approved && key.startsWith('sub_')) {
                        const item = metadata[key] as any
                        if (item && item.subId) {
                            await profileService.revertSubRecordStatus(item.type, item.subId)
                        }
                    }
                } else {
                    // Xử lý cho salary_upgrade
                    const { salaryRepo } = await import('@/modules/salary/salary.repo')
                    await salaryRepo.updateProposalStatus(inst.resourceId, approved ? 'approved' : 'rejected')
                    
                    // Cập nhật status vào chính metadata để thống nhất logic đếm
                    const newMetadata = {
                        ...metadata,
                        [key]: { ...(metadata[key] as any), status: approved ? 'approved' : 'rejected' }
                    }
                    await workflowEngine.updateMetadata(+instanceId, newMetadata)
                }
            } else {
                // For other resources, apply immediately (backward compatibility)
                if (approved) {
                    const mockInst = {
                        ...inst,
                        metadata: { [key]: itemData },
                        status: 'approved'
                    } as any
                    await dispatchWorkflowPartialApproval(mockInst, actorId)
                }
                const newMetadata = { ...metadata }
                delete newMetadata[key]
                await workflowEngine.updateMetadata(+instanceId, newMetadata)
            }

            // Lấy lại metadata mới để đếm số mục chưa xử lý còn lại
            const updatedInstRaw = await workflowEngine.getStatus(+instanceId)
            const updatedMetadata = updatedInstRaw.metadata || {}
            
            let remainingCount = 0
            for (const [mKey, mVal] of Object.entries(updatedMetadata)) {
                if ((mKey === 'main' || mKey.startsWith('sub_')) && !(mVal as any).status) {
                    remainingCount++
                }
            }

            // 3. Ghi log chi tiết và quyết định chuyển trạng thái
            if (remainingCount === 0) {
                const updatedInst = await workflowEngine.advance(
                    +instanceId,
                    actorId,
                    action || (approved ? 'approve' : 'forward'),
                    comment || (approved ? `Phê duyệt mục cuối: ${key}` : `Loại bỏ mục cuối: ${key}`)
                )
                res.json({
                    message: approved
                        ? `Đã phê duyệt mục "${key}" và hoàn tất quy trình.`
                        : `Đã loại bỏ mục "${key}" và hoàn tất quy trình.`,
                    data: updatedInst,
                    remainingItems: 0
                })
            } else {
                // Vẫn còn mục khác, ghi log vào wf_step_logs như một "lá phiếu" (ballot) cho mục lẻ này
                await db.insert(wfStepLogs).values({
                    instanceId: +instanceId,
                    stepNumber: inst.currentStep,
                    stepName: `Phê duyệt lẻ: ${key}`,
                    actorId,
                    action: 'ballot_submit', // Dùng action bỏ phiếu để thống nhất với BallotService
                    comment: comment || (approved ? `Đồng ý mục: ${key}` : `Từ chối mục: ${key}`),
                    ballotData: {
                        vote: approved ? 'approve' : 'reject', // Trường vote chuẩn theo BallotService
                        itemKey: key,
                        resource: itemData.type || 'main',
                        action: itemData.action || 'update',
                        data: itemData.data || itemData
                    }
                })

                res.json({
                    message: approved
                        ? `Đã phê duyệt mục "${key}". Quy trình giữ nguyên để xử lý ${remainingCount} mục còn lại.`
                        : `Đã loại bỏ mục "${key}". Quy trình giữ nguyên để xử lý ${remainingCount} mục còn lại.`,
                    remainingItems: remainingCount
                })
            }
        } catch (e) { next(e) }
    },
)

export const workflowRoutes: Router = router