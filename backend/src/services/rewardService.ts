import { Database } from 'sql.js';
import type { ExchangeableReward, RewardExchange, CreateRewardData, PointsHistoryEntry } from '../models/Reward';

export class RewardService {
  constructor(private db: Database) {}

  createReward(data: CreateRewardData, createdBy: number): ExchangeableReward {
    this.db.run(
      'INSERT INTO exchangeable_rewards (name, description, required_points, required_items, created_by, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [data.name, data.description || null, data.required_points, data.required_items || null, createdBy]
    );

    const result = this.db.exec('SELECT * FROM exchangeable_rewards WHERE id = last_insert_rowid()');
    return this.rowToReward(result[0].values[0]);
  }

  getActiveRewards(): ExchangeableReward[] {
    const result = this.db.exec('SELECT * FROM exchangeable_rewards WHERE is_active = 1 ORDER BY created_at DESC');
    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }
    return result[0].values.map((row) => this.rowToReward(row));
  }

  getRewardsByCreator(createdBy: number): ExchangeableReward[] {
    const result = this.db.exec('SELECT * FROM exchangeable_rewards WHERE created_by = ? ORDER BY created_at DESC', [createdBy]);
    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }
    return result[0].values.map((row) => this.rowToReward(row));
  }

  exchangeReward(userId: number, rewardId: number): RewardExchange {
    // Get reward
    const rewardResult = this.db.exec('SELECT * FROM exchangeable_rewards WHERE id = ? AND is_active = 1', [rewardId]);
    if (rewardResult.length === 0 || rewardResult[0].values.length === 0) {
      throw new Error('REWARD_NOT_FOUND');
    }
    const reward = this.rowToReward(rewardResult[0].values[0]);

    // Get user points
    const userResult = this.db.exec('SELECT total_points FROM users WHERE id = ?', [userId]);
    if (userResult.length === 0 || userResult[0].values.length === 0) {
      throw new Error('USER_NOT_FOUND');
    }
    const userPoints = userResult[0].values[0][0] as number;

    if (userPoints < reward.required_points) {
      throw new Error('INSUFFICIENT_POINTS');
    }

    // Deduct points
    this.db.run('UPDATE users SET total_points = total_points - ? WHERE id = ?', [reward.required_points, userId]);

    // Create exchange record
    this.db.run(
      'INSERT INTO reward_exchanges (user_id, reward_id, points_spent, status) VALUES (?, ?, ?, ?)',
      [userId, rewardId, reward.required_points, 'pending']
    );

    const exchangeResult = this.db.exec(`
      SELECT re.*, er.name as reward_name
      FROM reward_exchanges re
      JOIN exchangeable_rewards er ON re.reward_id = er.id
      WHERE re.id = last_insert_rowid()
    `);

    return this.rowToExchange(exchangeResult[0].values[0]);
  }

  getExchangeHistory(userId: number): RewardExchange[] {
    const result = this.db.exec(`
      SELECT re.*, er.name as reward_name
      FROM reward_exchanges re
      JOIN exchangeable_rewards er ON re.reward_id = er.id
      WHERE re.user_id = ?
      ORDER BY re.created_at DESC
    `, [userId]);

    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }
    return result[0].values.map((row) => this.rowToExchange(row));
  }

  fulfillExchange(exchangeId: number): void {
    const result = this.db.exec('SELECT * FROM reward_exchanges WHERE id = ?', [exchangeId]);
    if (result.length === 0 || result[0].values.length === 0) {
      throw new Error('EXCHANGE_NOT_FOUND');
    }

    const exchange = this.rowToExchange(result[0].values[0]);
    if (exchange.status === 'fulfilled') {
      throw new Error('ALREADY_FULFILLED');
    }

    this.db.run(
      "UPDATE reward_exchanges SET status = 'fulfilled', fulfilled_at = datetime('now') WHERE id = ?",
      [exchangeId]
    );
  }

  // Add points to a user (parent can manually reward child)
  addPointsToUser(userId: number, points: number, reason?: string): { userId: number; pointsAdded: number; newTotal: number } {
    // Verify user exists
    const userResult = this.db.exec('SELECT id, total_points FROM users WHERE id = ?', [userId]);
    if (userResult.length === 0 || userResult[0].values.length === 0) {
      throw new Error('USER_NOT_FOUND');
    }

    const currentPoints = userResult[0].values[0][1] as number;
    const newTotal = currentPoints + points;

    // Update user points
    this.db.run('UPDATE users SET total_points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newTotal, userId]);

    // Log the reward
    this.db.run(
      'INSERT INTO rewards (user_id, type, amount, description) VALUES (?, ?, ?, ?)',
      [userId, 'points', points, reason || '家长奖励']
    );

    return { userId, pointsAdded: points, newTotal };
  }

  // Get points history for a user
  getPointsHistory(userId: number): PointsHistoryEntry[] {
    const result = this.db.exec(`
      SELECT
        r.id,
        r.user_id,
        r.task_id,
        r.type,
        r.amount,
        r.item_name,
        r.description,
        r.created_at,
        COALESCE(t.title, '') as task_title
      FROM rewards r
      LEFT JOIN tasks t ON r.task_id = t.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);

    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }

    return result[0].values.map((row) => ({
      id: row[0] as number,
      user_id: row[1] as number,
      task_id: row[2] as number | null,
      type: row[3] as 'earned' | 'spent' | 'manual',
      amount: row[4] as number,
      item_name: row[5] as string | undefined,
      description: row[6] as string | undefined,
      created_at: row[7] as string,
      task_title: row[8] as string | undefined,
    }));
  }

  private rowToReward(row: any[]): ExchangeableReward {
    return {
      id: row[0] as number,
      name: row[1] as string,
      description: row[2] as string | undefined,
      required_points: row[3] as number,
      required_items: row[4] as string | undefined,
      created_by: row[5] as number,
      is_active: row[6] === 1,
      created_at: row[7] as string,
    };
  }

  private rowToExchange(row: any[]): RewardExchange {
    return {
      id: row[0] as number,
      user_id: row[1] as number,
      reward_id: row[2] as number,
      points_spent: row[3] as number,
      items_spent: row[4] as string | undefined,
      status: row[5] as 'pending' | 'fulfilled',
      created_at: row[6] as string,
      fulfilled_at: row[7] as string | undefined,
      reward_name: row[8] as string,
    };
  }
}
