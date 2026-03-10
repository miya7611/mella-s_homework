import { Router } from 'express';
import { NotificationService } from '../services/notificationService';
import { getDatabase } from '../database/connection';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const getNotificationService = () => new NotificationService(getDatabase());

// Get notifications for current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const notificationService = getNotificationService();
    const userId = req.user!.userId;
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;

    const notifications = notificationService.getNotificationsByUser(userId, limit, offset);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req: AuthRequest, res) => {
  try {
    const notificationService = getNotificationService();
    const userId = req.user!.userId;
    const count = notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const notificationService = getNotificationService();
    const id = Number(req.params.id);
    const success = notificationService.markAsRead(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '通知不存在' }
      });
    }

    res.json({
      success: true,
      message: '已标记为已读'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req: AuthRequest, res) => {
  try {
    const notificationService = getNotificationService();
    const userId = req.user!.userId;
    const count = notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: `已将 ${count} 条通知标记为已读`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    });
  }
});

// Delete a notification
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const notificationService = getNotificationService();
    const id = Number(req.params.id);
    const success = notificationService.deleteNotification(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '通知不存在' }
      });
    }

    res.json({
      success: true,
      message: '通知已删除'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message }
    });
  }
});

export default router;
