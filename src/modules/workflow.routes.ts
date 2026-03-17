import { Router, Request, Response, NextFunction } from 'express'
import { workflowEngine } from '@/core/workflow/engine'
import { ballotService } from '@/core/workflow/ballot.service'
import { requirePermission } from '@/core/middlewares/requirePermission'
import { ValidationError, ForbiddenError } from '@/core/middlewares/errorHandler'
import { ID } from '@/types'
import { PERM } from "@/constants/permission"
import { authenticate } from '@/core/middlewares/auth'

const router = Router()
router.use(authenticate)

/**
 * GET /workflow/tasks
 * Lấy danh sách task đang chờ xử lý của user hiện tại.
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
 * GET /workflow/:id
 * Xem trạng thái một workflow instance.
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
 * POST /workflow/:id/advance
 * Xử lý bước tiếp theo: approve / reject / request_revision / forward.
 *
 * Body: { action, comment? }
 */
router.post(
    '/:id/advance',
    requirePermission(PERM.WORKFLOW.WRITE),
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
 * POST /workflow/:id/cancel
 * Huỷ workflow instance.
 *
 * Body: { reason }
 */
router.post(
    '/:id/cancel',
    requirePermission(PERM.WORKFLOW.WRITE),
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
 * PATCH /workflow/:id/metadata
 * Cập nhật metadata tạm thời trong workflow (dùng khi admin sửa trước khi duyệt).
 * Chỉ hrm_director / headmaster có quyền.
 *
 * Body: { metadata }
 */
router.patch(
    '/:id/metadata',
    requirePermission(PERM.WORKFLOW.WRITE),
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