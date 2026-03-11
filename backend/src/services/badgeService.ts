import { Database } from 'sql.js';
import type { Badge, BadgeType, BadgeDefinition, BADGE_DEFINITIONS } from '../models/Badge';

export class BadgeService {
  constructor(private db: Database) {}

  getBadgeByType(userId: number, badgeType: BadgeType): Badge | null {
    const result = this.db.exec(
      'SELECT * FROM badges WHERE user_id = ? AND badge_type = ?',
      [userId, badgeType]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.rowToBadge(result[0].values[0]);
  }

  getBadgesByUser(userId: number): Badge[] {
    const result = this.db.exec(
      'SELECT * FROM badges WHERE user_id = ? ORDER BY earned_at DESC',
      [userId]
    );

    if (result.length === 0) return [];

    return result[0].values.map(row => this.rowToBadge(row));
  }

  earnBadge(userId: number, badgeType: BadgeType): Badge | null {
    // Check if already earned
    const existing = this.getBadgeByType(userId, badgeType);
    if (existing) return null;

    this.db.run(
      'INSERT INTO badges (user_id, badge_type) VALUES (?, ?)',
      [userId, badgeType]
    );

    const result = this.db.exec('SELECT * FROM badges WHERE id = last_insert_rowid()');
    return this.rowToBadge(result[0].values[0]);
  }

  checkAndAwardBadges(userId: number): Badge[] {
    const newBadges: Badge[] = [];

    // Get user stats
    const completedTasks = this.getCompletedTaskCount(userId);
    const totalPoints = this.getTotalPoints(userId);
    const streakDays = this.getStreakDays(userId);

    // Check task count badges
    if (completedTasks >= 1) {
      const badge = this.earnBadge(userId, 'first_task');
      if (badge) newBadges.push(badge);
    }
    if (completedTasks >= 10) {
      const badge = this.earnBadge(userId, 'task_master_10');
      if (badge) newBadges.push(badge);
    }
    if (completedTasks >= 50) {
      const badge = this.earnBadge(userId, 'task_master_50');
      if (badge) newBadges.push(badge);
    }
    if (completedTasks >= 100) {
      const badge = this.earnBadge(userId, 'task_master_100');
      if (badge) newBadges.push(badge);
    }

    // Check streak badges
    if (streakDays >= 3) {
      const badge = this.earnBadge(userId, 'streak_3');
      if (badge) newBadges.push(badge);
    }
    if (streakDays >= 7) {
      const badge = this.earnBadge(userId, 'streak_7');
      if (badge) newBadges.push(badge);
    }
    if (streakDays >= 30) {
      const badge = this.earnBadge(userId, 'streak_30');
      if (badge) newBadges.push(badge);
    }

    // Check points badges
    if (totalPoints >= 100) {
      const badge = this.earnBadge(userId, 'points_100');
      if (badge) newBadges.push(badge);
    }
    if (totalPoints >= 500) {
      const badge = this.earnBadge(userId, 'points_500');
      if (badge) newBadges.push(badge);
    }
    if (totalPoints >= 1000) {
      const badge = this.earnBadge(userId, 'points_1000');
      if (badge) newBadges.push(badge);
    }

    // Check category master badge
    if (this.hasCategoryMastery(userId)) {
      const badge = this.earnBadge(userId, 'category_master');
      if (badge) newBadges.push(badge);
    }

    return newBadges;
  }

  checkEarlyBird(userId: number, taskId: number): Badge | null {
    // Check if task was completed before scheduled time
    const result = this.db.exec(
      `SELECT t.scheduled_time, t.actual_end_time
       FROM tasks t
       WHERE t.id = ? AND t.assigned_to = ? AND t.status = 'completed'`,
      [taskId, userId]
    );

    if (result.length === 0 || result[0].values.length === 0) return null;

    const row = result[0].values[0];
    const scheduledTime = row[0] as string;
    const actualEndTime = row[1] as string;

    if (!scheduledTime || !actualEndTime) return null;

    // Compare times
    const scheduled = new Date(`2000-01-01 ${scheduledTime}`);
    const actual = new Date(actualEndTime);

    if (actual.getHours() < scheduled.getHours() ||
        (actual.getHours() === scheduled.getHours() && actual.getMinutes() < scheduled.getMinutes())) {
      return this.earnBadge(userId, 'early_bird');
    }

    return null;
  }

  private getCompletedTaskCount(userId: number): number {
    const result = this.db.exec(
      "SELECT COUNT(*) FROM tasks WHERE assigned_to = ? AND status = 'completed'",
      [userId]
    );

    if (result.length === 0) return 0;
    return result[0].values[0][0] as number;
  }

  private getTotalPoints(userId: number): number {
    const result = this.db.exec(
      'SELECT total_points FROM users WHERE id = ?',
      [userId]
    );

    if (result.length === 0 || result[0].values.length === 0) return 0;
    return result[0].values[0][0] as number;
  }

  private getStreakDays(userId: number): number {
    // Get all completed task dates
    const result = this.db.exec(
      `SELECT DISTINCT DATE(actual_end_time) as date
       FROM tasks
       WHERE assigned_to = ? AND status = 'completed' AND actual_end_time IS NOT NULL
       ORDER BY date DESC`,
      [userId]
    );

    if (result.length === 0 || result[0].values.length === 0) return 0;

    const dates = result[0].values.map(row => row[0] as string);
    if (dates.length === 0) return 0;

    let streak = 1;
    const today = new Date().toISOString().split('T')[0];

    // Check if completed today or yesterday
    const firstDate = dates[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (firstDate !== today && firstDate !== yesterdayStr) return 0;

    // Count consecutive days
    for (let i = 1; i < dates.length; i++) {
      const current = new Date(dates[i - 1]);
      const prev = new Date(dates[i]);
      const diffDays = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private hasCategoryMastery(userId: number): boolean {
    const result = this.db.exec(
      `SELECT category, COUNT(*) as count
       FROM tasks
       WHERE assigned_to = ? AND status = 'completed'
       GROUP BY category
       HAVING count >= 20`,
      [userId]
    );

    return result.length > 0 && result[0].values.length > 0;
  }

  private rowToBadge(row: any[]): Badge {
    return {
      id: row[0] as number,
      user_id: row[1] as number,
      badge_type: row[2] as BadgeType,
      earned_at: row[3] as string
    };
  }
}
