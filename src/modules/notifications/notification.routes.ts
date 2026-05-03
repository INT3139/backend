import { Router } from 'express';
import * as controller from './notification.controller';
import { authenticate } from '@/core/middlewares/auth';
import { requirePermission } from '@/core/middlewares/requirePermission';
import { PERM } from '@/constants/permission';

const router: Router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notifications
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', requirePermission(PERM.NOTIFICATION.READ), controller.getMyNotifications);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/read', requirePermission(PERM.NOTIFICATION.READ), controller.markAsRead);

/**
 * @openapi
 * /notifications/mark-all-read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security: [{ bearerAuth: [] }]
 */
router.post('/mark-all-read', requirePermission(PERM.NOTIFICATION.READ), controller.markAllAsRead);

export const notificationRoutes = router;
