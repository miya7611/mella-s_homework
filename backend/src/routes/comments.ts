import { Router } from 'express';
import { TaskCommentService } from '../services/taskCommentService';
import { TaskService } from '../services/taskService';
import { NotificationService } from '../services/notificationService';
import { getDatabase } from '../database/connection';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router({ mergeParams: true });

const getCommentService = () => new TaskCommentService(getDatabase());
const getTaskService = () => new TaskService(getDatabase());
const getNotificationService = () => new NotificationService(getDatabase());

// Get comments for a task
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const commentService = getCommentService();
    const taskId = Number(req.params.taskId);
    const comments = commentService.getCommentsByTask(taskId);

    res.json({
      success: true,
      data: comments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Add comment to a task
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const commentService = getCommentService();
    const taskService = getTaskService();
    const notificationService = getNotificationService();
    const taskId = Number(req.params.taskId);
    const userId = req.user!.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '评论内容不能为空' }
      });
    }

    const comment = commentService.createComment(taskId, userId, { content: content.trim() });

    // Get task info and send notification
    const task = taskService.getTaskById(taskId);
    if (task) {
      // Notify the other party (if commenter is assigned user, notify creator, and vice versa)
      const notifyUserId = userId === task.assigned_to ? task.created_by : task.assigned_to;
      if (notifyUserId && notifyUserId !== userId) {
        notificationService.createNotification(notifyUserId, {
          type: 'new_comment',
          title: '新评论',
          message: `有人评论了任务「${task.title}」: ${content.trim().substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          data: { taskId, commentId: comment.id }
        });
      }
    }

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    });
  }
});

// Delete a comment
router.delete('/:commentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const commentService = getCommentService();
    const commentId = Number(req.params.commentId);
    const deleted = commentService.deleteComment(commentId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '评论不存在' }
      });
    }

    res.json({
      success: true,
      message: '评论已删除'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message }
    });
  }
});

export default router;
