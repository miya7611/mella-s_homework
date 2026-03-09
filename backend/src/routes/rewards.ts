import { Router } from 'express';
import { RewardService } from '../services/rewardService';
import { getDatabase, saveDatabase } from '../database/connection';
import { authenticate, requireParent, AuthRequest } from '../middleware/auth';

const router = Router();

const getRewardService = () => new RewardService(getDatabase());

// Create reward (parent only)
router.post('/', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const { name, description, required_points, required_items } = req.body;

    if (!name || required_points === undefined) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Name and required_points are required' }
      });
    }

    const rewardService = getRewardService();
    const reward = rewardService.createReward(
      { name, description, required_points, required_items },
      req.user!.userId
    );
    saveDatabase();

    res.status(201).json({
      success: true,
      data: reward
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    });
  }
});

// Get all active rewards
router.get('/', authenticate, async (_req: AuthRequest, res) => {
  try {
    const rewardService = getRewardService();
    const rewards = rewardService.getActiveRewards();

    res.json({
      success: true,
      data: rewards
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Exchange reward (child)
router.post('/exchange', authenticate, async (req: AuthRequest, res) => {
  try {
    const { reward_id } = req.body;

    if (!reward_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'reward_id is required' }
      });
    }

    const rewardService = getRewardService();
    const exchange = rewardService.exchangeReward(req.user!.userId, reward_id);
    saveDatabase();

    res.status(201).json({
      success: true,
      data: exchange
    });
  } catch (error: any) {
    let code = 'EXCHANGE_FAILED';
    let message = 'Exchange failed';
    let status = 400;

    if (error.message === 'REWARD_NOT_FOUND') {
      code = 'REWARD_NOT_FOUND';
      message = 'Reward not found';
    } else if (error.message === 'INSUFFICIENT_POINTS') {
      code = 'INSUFFICIENT_POINTS';
      message = 'Insufficient points';
    }

    res.status(status).json({
      success: false,
      error: { code, message }
    });
  }
});

// Get exchange history
router.get('/exchanges', authenticate, async (req: AuthRequest, res) => {
  try {
    const rewardService = getRewardService();
    const exchanges = rewardService.getExchangeHistory(req.user!.userId);

    res.json({
      success: true,
      data: exchanges
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Fulfill exchange (parent only)
router.patch('/exchanges/:id/fulfill', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const rewardService = getRewardService();
    rewardService.fulfillExchange(Number(id));
    saveDatabase();

    res.json({
      success: true,
      message: 'Exchange fulfilled'
    });
  } catch (error: any) {
    let code = 'FULFILL_FAILED';
    let message = 'Failed to fulfill exchange';

    if (error.message === 'EXCHANGE_NOT_FOUND') {
      code = 'EXCHANGE_NOT_FOUND';
      message = 'Exchange not found';
    } else if (error.message === 'ALREADY_FULFILLED') {
      code = 'ALREADY_FULFILLED';
      message = 'Exchange already fulfilled';
    }

    res.status(400).json({
      success: false,
      error: { code, message }
    });
  }
});

// Add points to user (parent only - for manual rewards)
router.post('/add-points', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const { user_id, points, reason } = req.body;

    if (!user_id || !points || points <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'user_id and positive points are required' }
      });
    }

    const rewardService = getRewardService();
    const result = rewardService.addPointsToUser(user_id, points, reason);
    saveDatabase();

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    let code = 'ADD_POINTS_FAILED';
    let message = 'Failed to add points';

    if (error.message === 'USER_NOT_FOUND') {
      code = 'USER_NOT_FOUND';
      message = 'User not found';
    }

    res.status(400).json({
      success: false,
      error: { code, message }
    });
  }
});

export default router;
