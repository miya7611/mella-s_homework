import { Router } from 'express';
import { StatsService } from '../services/statsService';
import { getDatabase } from '../database/connection';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const getStatsService = () => new StatsService(getDatabase());

// Get user statistics
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { days } = req.query;
    const statsService = getStatsService();
    const userId = req.user!.userId;
    const numDays = Number(days) || 7;

    const stats = statsService.getUserStats(userId, numDays);

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

export default router;
