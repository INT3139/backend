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
 * Helper để xử lý duyệt/từ chối một mục lẻ trong metadata
 */
async function handleMetadataItemAction(
    instanceId: string,
    key: string,
    approved: boolean,
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { action, comment } = req.body
        const actorId = req.userId as ID

        // 1. Lấy trạng thái hiện tại của workflow (Bỏ qua cache để đảm bảo đếm chính xác)
        const inst = await workflowEngine.getStatus(+instanceId, false)
        const metadata = inst.metadata || {}

        // Kiểm tra xem mục này có tồn tại và chưa xử lý không
        const itemData = metadata[key]
        if (!itemData || (itemData as any).status) {
            throw new ValidationError(`Mục "${key}" không tồn tại hoặc đã được xử lý trước đó.`)
        }

        // 2. Xử lý tức thì (Immediate Processing) cho Profile và Salary Upgrade
        if (inst.resourceType === 'profile' || inst.resourceType === 'salary_upgrade') {
            if (inst.resourceType === 'profile') {
                await profileRepo.movePendingToProcessed(+instanceId, key, approved ? 'approved' : 'rejected', actorId)
                
                if (approved) {
                    const mockInst = {
                        ...inst,
                        metadata: { [key]: itemData },
                        status: 'approved'
                    } as any
                    await dispatchWorkflowPartialApproval(mockInst, actorId)
                } else if (key.startsWith('sub_')) {
                    const item = metadata[key] as any
                    if (item && item.subId) {
                        await profileService.revertSubRecordStatus(item.type, item.subId)
                    }
                }
            } else {
                // Xử lý cho salary_upgrade
                const { salaryRepo } = await import('@/modules/salary/salary.repo')
                await salaryRepo.updateProposalStatus(inst.resourceId, approved ? 'approved' : 'rejected')
                
                const newMetadata = {
                    ...metadata,
                    [key]: { ...(metadata[key] as any), status: approved ? 'approved' : 'rejected' }
                }
                await workflowEngine.updateMetadata(+instanceId, newMetadata)
            }
        } else {
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

        // Đếm số mục chưa xử lý còn lại
        // Một mục được coi là "cần xử lý" nếu key là 'main' hoặc bắt đầu bằng 'sub_'
        // Một mục được coi là "đã xử lý" nếu nó có trường 'status'
        let remainingCount = 0
        const entries = Object.entries(metadata)
        
        for (const [mKey, mVal] of entries) {
            const isTargetItem = mKey === 'main' || mKey.startsWith('sub_')
            if (isTargetItem) {
                const isAlreadyProcessed = !!(mVal as any).status
                const isCurrentItem = mKey === key
                
                // Nếu mục này chưa xử lý và KHÔNG PHẢI là mục chúng ta đang làm ngay lúc này
                if (!isAlreadyProcessed && !isCurrentItem) {
                    remainingCount++
                }
            }
        }

        // 3. Quyết định chuyển trạng thái workflow (Advance to next step or complete)
        if (remainingCount === 0) {
            const updatedInst = await workflowEngine.advance(
                +instanceId,
                actorId,
                action || (approved ? 'approve' : 'forward'),
                comment || (approved ? `Hoàn tất mục cuối: ${key}` : `Loại bỏ mục cuối: ${key}`)
            )
            return res.json({
                message: approved
                    ? `Đã phê duyệt mục "${key}" và hoàn tất bước quy trình.`
                    : `Đã loại bỏ mục "${key}" và hoàn tất bước quy trình.`,
                data: updatedInst,
                remainingItems: 0
            })
        } else {
            // Ghi log chi tiết như một lá phiếu cho mục lẻ
            await db.insert(wfStepLogs).values({
                instanceId: +instanceId,
                stepNumber: inst.currentStep,
                stepName: `Xử lý lẻ: ${key}`,
                actorId,
                action: 'ballot_submit',
                comment: comment || (approved ? `Đồng ý mục: ${key}` : `Từ chối mục: ${key}`),
                ballotData: {
                    vote: approved ? 'approve' : 'reject',
                    itemKey: key,
                    resource: (itemData as any).type || 'main',
                    action: (itemData as any).action || 'update',
                    data: (itemData as any).data || itemData
                }
            })

            return res.json({
                message: approved
                    ? `Đã chuyển tiếp mục "${key}". Quy trình giữ nguyên để xử lý ${remainingCount} mục còn lại.`
                    : `Đã loại bỏ mục "${key}". Quy trình giữ nguyên để xử lý ${remainingCount} mục còn lại.`,
                remainingItems: remainingCount
            })
        }
    } catch (e) { next(e) }
}

/**
 * @openapi
 * /workflow/{id}/{key}/advance:
 *   post:
 *     tags:
 *       - Workflow
 *     summary: Advance a specific metadata item
 *     description: Approve/Advance a specific item (main or sub-record) in the current step. If all items are advanced, the whole workflow moves to the next step.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: key
 *         required: true
 *         description: The metadata key (e.g., 'main', 'sub_family_73')
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment: { type: string }
 *               action: { type: string, enum: [approve, forward] }
 *     responses:
 *       200:
 *         description: Item advanced successfully
 */
router.post(
    '/:id/:key/advance',
    requirePermission(PERM.WORKFLOW.ADVANCE),
    async (req, res, next) => handleMetadataItemAction(req.params.id as string, req.params.key as string, true, req, res, next)
)

/**
 * @openapi
 * /workflow/{id}/{key}/cancel:
 *   post:
 *     tags:
 *       - Workflow
 *     summary: Cancel/Reject a specific metadata item
 *     description: Reject changes of a specific item for the current workflow.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment: { type: string }
 *               action: { type: string, enum: [reject, request_revision, forward] }
 *     responses:
 *       200:
 *         description: Item cancelled successfully
 */
router.post(
    '/:id/:key/cancel',
    requirePermission(PERM.WORKFLOW.ADVANCE),
    async (req, res, next) => handleMetadataItemAction(req.params.id as string, req.params.key as string, false, req, res, next)
)

/**
 * @openapi
 * /workflow/{id}/{key}:
 *   patch:
 *     tags:
 *       - Workflow
 *     summary: Process a specific metadata item (Legacy)
 *     deprecated: true
 *     description: Use /advance or /cancel endpoints instead.
 */
router.patch(
    '/:id/:key',
    requirePermission(PERM.WORKFLOW.ADVANCE),
    async (req: Request, res: Response, next: NextFunction) => {
        const approved = req.body.approved === true
        return handleMetadataItemAction(req.params.id as string, req.params.key as string, approved, req, res, next)
    },
)

/**
 * @openapi
 * /workflow/{id}/{key}:
 *   patch:
 *     tags:
 *       - Workflow
 *     summary: Process a specific metadata item (Legacy)
 *     deprecated: true
 *     description: Use /approve or /reject endpoints instead.
 */
router.patch(
    '/:id/:key',
    requirePermission(PERM.WORKFLOW.ADVANCE),
    async (req: Request, res: Response, next: NextFunction) => {
        const approved = req.body.approved === true
        return handleMetadataItemAction(req.params.id as string, req.params.key as string, approved, req, res, next)
    },
)

export const workflowRoutes: Router = router