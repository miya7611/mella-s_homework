import { Database } from 'sql.js';
import type { UserStats, DailyStats, TaskStats } from '../models/Stats';

export class StatsService {
  constructor(private db: Database) {}

  getUserStats(userId: number, days: number = 7): UserStats {
    const taskStats = this.getTaskStats(userId);
    const pointsStats = this.getPointsStats(userId);
    const timeStats = this.getTimeStats(userId);
    const dailyStats = this.getDailyStats(userId, days);

    return {
      total_tasks: taskStats.total,
      completed_tasks: taskStats.completed,
      total_points: pointsStats.total,
      points_earned: pointsStats.earned,
      points_spent: pointsStats.spent,
      total_time_minutes: timeStats,
      daily_stats: dailyStats,
      task_stats: taskStats
    };
  }

  private getTaskStats(userId: number): TaskStats {
    const result = this.db.exec(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' OR status = 'planned' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'overtime' THEN 1 ELSE 0 END) as overtime
      FROM tasks
      WHERE assigned_to = ?
    `, [userId]);

    const row = result[0].values[0];
    return {
      total: row[0] as number,
      completed: row[1] as number,
      pending: row[2] as number,
      in_progress: row[3] as number,
      overtime: row[4] as number
    };
  }

  private getPointsStats(userId: number): { total: number; earned: number; spent: number } {
    const userResult = this.db.exec(
      'SELECT total_points FROM users WHERE id = ?',
      [userId]
    );
    const total = userResult[0].values[0][0] as number;

    const earnedResult = this.db.exec(`
      SELECT COALESCE(SUM(amount), 0) as earned
      FROM rewards
      WHERE user_id = ? AND type IN ('points', 'manual')
    `, [userId]);

    const earned = earnedResult[0].values[0][0] as number;

    const spentResult = this.db.exec(`
      SELECT COALESCE(SUM(points_spent), 0) as spent
      FROM reward_exchanges
      WHERE user_id = ?
    `, [userId]);

    const spent = spentResult[0].values[0][0] as number;

    return { total, earned, spent };
  }

  private getTimeStats(userId: number): number {
    const result = this.db.exec(`
      SELECT COALESCE(SUM(duration), 0) as total_minutes
      FROM time_logs
      WHERE user_id = ? AND end_time IS NOT NULL
    `, [userId]);

    return result[0].values[0][0] as number;
  }

  private getDailyStats(userId: number, days: number): DailyStats[] {
    const stats: DailyStats[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Get tasks completed
      const tasksResult = this.db.exec(`
        SELECT COUNT(*) as count
        FROM tasks
        WHERE assigned_to = ? AND status = 'completed' AND date(created_at) = ?
      `, [userId, dateStr]);

      const tasksCompleted = tasksResult[0].values[0][0] as number;

      // Get points earned
      const pointsResult = this.db.exec(`
        SELECT COALESCE(SUM(amount), 0) as points
        FROM rewards
        WHERE user_id = ? AND date(created_at) = ?
      `, [userId, dateStr]);

      const pointsEarned = pointsResult[0].values[0][0] as number;

      // Get time spent
      const timeResult = this.db.exec(`
        SELECT COALESCE(SUM(duration), 0) as minutes
        FROM time_logs
        WHERE user_id = ? AND date(created_at) = ? AND end_time IS NOT null
      `, [userId, dateStr]);

      const timeSpent = timeResult[0].values[0][0] as number;

      stats.push({
        date: dateStr,
        tasks_completed: tasksCompleted,
        points_earned: pointsEarned,
        time_spent: timeSpent
      });
    }

    return stats;
  }
}
