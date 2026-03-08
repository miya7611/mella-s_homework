import { Router } from 'express';
import { TimeService } from '../services/timeService';
import { getDatabase, saveDatabase } from '../database/connection';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const getTimeService = () => new TimeService(getDatabase());

// Get time logs for a task
router.get('/task/:taskId', authenticate, async (req: AuthRequest, res) => {
  try {
    const timeService = getTimeService();
    const timeLogs = timeService.getTimeLogsByTaskId(Number(req.params.taskId));

    res.json({
      success: true,
      data: timeLogs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message },
    });
  }
});

// Get time logs for current user
router.get('/my-logs', authenticate, async (req: AuthRequest, res) => {
  try {
    const timeService = getTimeService();
    const timeLogs = timeService.getTimeLogsByUserId(req.user!.userId);

    res.json({
      success: true,
      data: timeLogs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message },
    });
  }
});

// Start time log (create new log with start_time)
router.post('/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const { task_id, notes } = req.body;

    if (!task_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'task_id is required' },
      });
    }

    const timeService = getTimeService();
    const timeLog = timeService.createTimeLog({
      task_id,
      user_id: req.user!.userId,
      start_time: new Date().toISOString(),
      notes,
    });
    saveDatabase();

    res.status(201).json({
      success: true,
      data: timeLog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message },
    });
  }
});

// Stop time log (update end_time)
router.put('/:id/stop', authenticate, async (req: AuthRequest, res) => {
  try {
    const { suggested_duration } = req.body;

    const timeService = getTimeService();
    const timeLog = timeService.stopTimeLog(
      Number(req.params.id),
      suggested_duration
    );
    saveDatabase();

    res.json({
      success: true,
      data: timeLog,
    });
  } catch (error: any) {
    let code = 'UPDATE_FAILED';
    let message = error.message;

    if (error.message === 'TIME_LOG_NOT_FOUND') {
      code = 'NOT_FOUND';
      message = 'Time log not found';
    }

    res.status(400).json({
      success: false,
      error: { code, message },
    });
  }
});

// Delete time log
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const timeService = getTimeService();
    const deleted = timeService.deleteTimeLog(Number(req.params.id));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Time log not found' },
      });
    }

    saveDatabase();

    res.json({
      success: true,
      message: 'Time log deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message },
    });
  }
});

export default router;
