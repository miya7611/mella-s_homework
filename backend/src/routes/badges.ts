import { Router } from 'express';
import { BadgeService } from '../services/badgeService';
import { getDatabase } from '../database/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { BADGE_DEFINITIONS } from '../models/Badge';

const router = Router();

const getBadgeService = () => new BadgeService(getDatabase());

// Get user's badges
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const badgeService = getBadgeService();
    const userId = req.user!.userId;
    const badges = badgeService.getBadgesByUser(userId);

    // Merge with badge definitions
    const badgesWithInfo = badges.map(badge => {
      const definition = BADGE_DEFINITIONS.find(d => d.type === badge.badge_type);
      return {
        ...badge,
        name: definition?.name || badge.badge_type,
        description: definition?.description || '',
        icon: definition?.icon || '🏅'
      };
    });

    res.json({
      success: true,
      data: badgesWithInfo
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Get all badge definitions
router.get('/definitions', authenticate, async (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: BADGE_DEFINITIONS
  });
});

// Get badge stats
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const badgeService = getBadgeService();
    const userId = req.user!.userId;
    const earnedBadges = badgeService.getBadgesByUser(userId);

    const stats = {
      totalBadges: BADGE_DEFINITIONS.length,
      earnedBadges: earnedBadges.length,
      badges: BADGE_DEFINITIONS.map(def => ({
        ...def,
        earned: earnedBadges.some(b => b.badge_type === def.type),
        earnedAt: earnedBadges.find(b => b.badge_type === def.type)?.earned_at || null
      }))
    };

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

// Check for new badges (manual trigger)
router.post('/check', authenticate, async (req: AuthRequest, res) => {
  try {
    const badgeService = getBadgeService();
    const userId = req.user!.userId;
    const newBadges = badgeService.checkAndAwardBadges(userId);

    const badgesWithInfo = newBadges.map(badge => {
      const definition = BADGE_DEFINITIONS.find(d => d.type === badge.badge_type);
      return {
        ...badge,
        name: definition?.name || badge.badge_type,
        description: definition?.description || '',
        icon: definition?.icon || '🏅'
      };
    });

    res.json({
      success: true,
      data: badgesWithInfo,
      message: newBadges.length > 0 ? `恭喜获得 ${newBadges.length} 个新徽章！` : '暂无新徽章'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CHECK_FAILED', message: error.message }
    });
  }
});

export default router;
