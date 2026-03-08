import { Database } from 'sql.js';
import type { TimeLog } from '../models/TimeLog';

export class TimeService {
  constructor(private db: Database) {}

  getTimeLogsByTaskId(taskId: number): TimeLog[] {
    const result = this.db.exec(
      'SELECT * FROM time_logs WHERE task_id = ? ORDER BY start_time DESC',
      [taskId]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }

    return result[0].values.map((row) => this.rowToTimeLog(row));
  }

  getTimeLogsByUserId(userId: number): TimeLog[] {
    const result = this.db.exec(
      'SELECT * FROM time_logs WHERE user_id = ? ORDER BY start_time DESC',
      [userId]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }

    return result[0].values.map((row) => this.rowToTimeLog(row));
  }

  getTimeLogById(id: number): TimeLog | null {
    const result = this.db.exec('SELECT * FROM time_logs WHERE id = ?', [id]);

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.rowToTimeLog(result[0].values[0]);
  }

  createTimeLog(data: {
    task_id: number;
    user_id: number;
    start_time: string;
    notes?: string;
  }): TimeLog {
    this.db.run(
      'INSERT INTO time_logs (task_id, user_id, start_time, end_time, duration, is_overtime, notes) VALUES (?, ?, ?, NULL, 0, 0, ?)',
      [data.task_id, data.user_id, data.start_time, data.notes || null]
    );

    const result = this.db.exec('SELECT * FROM time_logs WHERE id = last_insert_rowid()');
    return this.rowToTimeLog(result[0].values[0]);
  }

  stopTimeLog(id: number, suggestedDuration?: number): TimeLog {
    const timeLog = this.getTimeLogById(id);
    if (!timeLog) {
      throw new Error('TIME_LOG_NOT_FOUND');
    }

    const endTime = new Date();
    const startTime = new Date(timeLog.start_time);
    const durationMinutes = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 60000
    );

    const isOvertime = suggestedDuration ? durationMinutes > suggestedDuration : false;

    this.db.run(
      'UPDATE time_logs SET end_time = ?, duration = ?, is_overtime = ? WHERE id = ?',
      [endTime.toISOString(), durationMinutes, isOvertime ? 1 : 0, id]
    );

    const result = this.db.exec('SELECT * FROM time_logs WHERE id = ?', [id]);
    return this.rowToTimeLog(result[0].values[0]);
  }

  deleteTimeLog(id: number): boolean {
    const result = this.db.exec('SELECT id FROM time_logs WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return false;
    }

    this.db.run('DELETE FROM time_logs WHERE id = ?', [id]);
    return true;
  }

  private rowToTimeLog(row: any[]): TimeLog {
    return {
      id: row[0] as number,
      task_id: row[1] as number,
      user_id: row[2] as number,
      start_time: row[3] as string,
      end_time: row[4] as string | null,
      duration: row[5] as number,
      is_overtime: row[6] === 1,
      notes: row[7] as string | undefined,
      created_at: row[8] as string,
    };
  }
}
