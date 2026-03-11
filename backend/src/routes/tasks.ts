import { Router } from 'express';
import { TaskService } from '../services/taskService';
import { NotificationService } from '../services/notificationService';
import { getDatabase, saveDatabase } from '../database/connection';
import { authenticate, requireParent, AuthRequest } from '../middleware/auth';

const router = Router();

const getTaskService = () => new TaskService(getDatabase());
const getNotificationService = () => new NotificationService(getDatabase());

// Create task (parent only)
router.post('/', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, assigned_to, suggested_duration, scheduled_date, scheduled_time, points, bonus_items, overtime_penalty } = req.body;

    if (!title || !category || !assigned_to || !scheduled_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Title, category, assigned_to, and scheduled_date are required'
        }
      });
    }

    const taskService = getTaskService();
    const notificationService = getNotificationService();
    const task = taskService.createTask(
      { title, description, category, assigned_to, suggested_duration, scheduled_date, scheduled_time, points: points || 0, bonus_items, overtime_penalty },
      req.user!.userId
    );

    // Send notification to assigned user
    notificationService.createNotification(assigned_to, {
      type: 'task_assigned',
      title: '新任务分配',
      message: `你被分配了一个新任务「${title}」，截止日期：${scheduled_date}`,
      data: { taskId: task.id }
    });

    saveDatabase();

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    });
  }
});

// Get tasks (filter by user or date)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const taskService = getTaskService();
    const { userId, date, createdBy } = req.query;

    let tasks;

    if (date && userId) {
      tasks = taskService.getTasksByDate(Number(userId), date as string);
    } else if (userId) {
      tasks = taskService.getTasksByUser(Number(userId));
    } else if (createdBy) {
      tasks = taskService.getTasksByCreator(Number(createdBy));
    } else {
      // Default: get tasks for current user
      tasks = taskService.getTasksByUser(req.user!.userId);
    }

    res.json({
      success: true,
      data: tasks
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Get task by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const taskService = getTaskService();
    const task = taskService.getTaskById(Number(req.params.id));

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Update task
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const taskService = getTaskService();
    const task = taskService.getTaskById(Number(req.params.id));

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    // Only creator (parent) or assigned user can update
    if (task.created_by !== req.user!.userId && task.assigned_to !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to update this task' }
      });
    }

    const updatedTask = taskService.updateTask(Number(req.params.id), req.body);
    saveDatabase();

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    });
  }
});

// Update task status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'planned', 'in_progress', 'pending_review', 'completed', 'rejected', 'overtime'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Valid status is required' }
      });
    }

    const taskService = getTaskService();
    const notificationService = getNotificationService();
    const task = taskService.getTaskById(Number(req.params.id));

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    // Only assigned user can update status
    if (task.assigned_to !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only assigned user can update task status' }
      });
    }

    const updatedTask = taskService.updateTaskStatus(Number(req.params.id), status);

    // Send notification to task creator when task is submitted for review
    if (status === 'pending_review' && task.created_by !== task.assigned_to) {
      notificationService.createNotification(task.created_by, {
        type: 'task_completed',
        title: '任务待审核',
        message: `任务「${task.title}」已完成，等待审核`,
        data: { taskId: task.id }
      });
    }

    saveDatabase();

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    });
  }
});

// Get pending review tasks (parent only)
router.get('/pending-review', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const taskService = getTaskService();
    const tasks = taskService.getPendingReviewTasks(req.user!.userId);

    res.json({
      success: true,
      data: tasks
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Review task (parent only)
router.post('/:id/review', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const { approved, comment } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'approved (boolean) is required' }
      });
    }

    const taskService = getTaskService();
    const notificationService = getNotificationService();
    const task = taskService.getTaskById(Number(req.params.id));

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    // Only task creator can review
    if (task.created_by !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only task creator can review this task' }
      });
    }

    // Task must be pending_review
    if (task.status !== 'pending_review') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Task is not pending review' }
      });
    }

    const updatedTask = taskService.reviewTask(Number(req.params.id), approved, comment);

    // Send notification to assigned user
    notificationService.createNotification(task.assigned_to, {
      type: approved ? 'task_completed' : 'task_overdue',
      title: approved ? '任务审核通过' : '任务审核未通过',
      message: approved
        ? `任务「${task.title}」已通过审核，获得 ${task.points} 积分！`
        : `任务「${task.title}」未通过审核${comment ? `：${comment}` : ''}`,
      data: { taskId: task.id }
    });

    saveDatabase();

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'REVIEW_FAILED', message: error.message }
    });
  }
});

// Delete task (parent only)
router.delete('/:id', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const taskService = getTaskService();
    const deleted = taskService.deleteTask(Number(req.params.id));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    saveDatabase();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message }
    });
  }
});

export default router;