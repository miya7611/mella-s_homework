import { Database } from 'sql.js';
import type { Notification, CreateNotificationData } from '../models/Notification';

export class NotificationService {
  constructor(private db: Database) {}

  createNotification(userId: number, data: CreateNotificationData): Notification {
    const dataJson = data.data ? JSON.stringify(data.data) : null;

    this.db.run(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, data.type, data.title, data.message, dataJson]
    );

    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0] as number;

    return this.getNotificationById(id)!;
  }

  getNotificationById(id: number): Notification | null {
    const result = this.db.exec(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.rowToNotification(result[0].values[0]);
  }

  getNotificationsByUser(userId: number, limit: number = 20, offset: number = 0): Notification[] {
    const result = this.db.exec(
      `SELECT * FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map(row => this.rowToNotification(row));
  }

  getUnreadCount(userId: number): number {
    const result = this.db.exec(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    return result[0].values[0][0] as number;
  }

  markAsRead(id: number): boolean {
    this.db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);

    const result = this.db.exec('SELECT changes()');
    return (result[0].values[0][0] as number) > 0;
  }

  markAllAsRead(userId: number): number {
    this.db.run(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    const result = this.db.exec('SELECT changes()');
    return result[0].values[0][0] as number;
  }

  deleteNotification(id: number): boolean {
    this.db.run('DELETE FROM notifications WHERE id = ?', [id]);

    const result = this.db.exec('SELECT changes()');
    return (result[0].values[0][0] as number) > 0;
  }

  deleteOldNotifications(days: number = 30): number {
    this.db.run(
      'DELETE FROM notifications WHERE is_read = 1 AND created_at < datetime("now", ?)',
      [`-${days} days`]
    );

    const result = this.db.exec('SELECT changes()');
    return result[0].values[0][0] as number;
  }

  private rowToNotification(row: any[]): Notification {
    return {
      id: row[0] as number,
      user_id: row[1] as number,
      type: row[2] as Notification['type'],
      title: row[3] as string,
      message: row[4] as string,
      data: row[5] as string,
      is_read: row[6] === 1,
      created_at: row[7] as string
    };
  }
}
