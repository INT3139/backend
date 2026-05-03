import { Request, Response, NextFunction } from 'express';
import { notificationService } from '@/services/notification.service';
import { ID } from '@/types';

/**
 * Get all unread notifications for the current user
 */
export async function getMyNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await notificationService.getUnread(req.userId as ID);
    res.json({ data: notifications });
  } catch (e) {
    next(e);
  }
}

/**
 * Mark a specific notification as read
 */
export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationService.markAsRead(+req.params.id, req.userId as ID);
    res.json({ message: 'Marked as read' });
  } catch (e) {
    next(e);
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationService.markAllAsRead(req.userId as ID);
    res.json({ message: 'All marked as read' });
  } catch (e) {
    next(e);
  }
}
