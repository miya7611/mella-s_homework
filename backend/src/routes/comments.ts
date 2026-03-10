import { Router } from 'express';
import { TaskCommentService } from '../services/taskCommentService';
import { getDatabase } from '../database/connection';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router({ mergeParams: true });

const getCommentService = () => new TaskCommentService(getDatabase());

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
