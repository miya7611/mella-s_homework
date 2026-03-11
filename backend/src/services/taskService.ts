import { Task, CreateTaskData, UpdateTaskData } from '../models/Task';
import { Database } from 'sql.js';

export class TaskService {
  constructor(private db: Database) {}

  createTask(data: CreateTaskData, createdBy: number): Task {
    this.db.run(
      `INSERT INTO tasks (
        title, description, category, assigned_to, created_by,
        suggested_duration, scheduled_date, scheduled_time,
        points, bonus_items, overtime_penalty, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        data.title,
        data.description || null,
        data.category,
        data.assigned_to,
        createdBy,
        data.suggested_duration || null,
        data.scheduled_date,
        data.scheduled_time || null,
        data.points,
        data.bonus_items || null,
        data.overtime_penalty || null
      ]
    );

    const result = this.db.exec('SELECT * FROM tasks WHERE id = last_insert_rowid()');
    return this.rowToTask(result[0].values[0]);
  }

  getTaskById(id: number): Task | null {
    const result = this.db.exec('SELECT * FROM tasks WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }
    return this.rowToTask(result[0].values[0]);
  }

  getTasksByUser(userId: number): Task[] {
    const result = this.db.exec(
      'SELECT * FROM tasks WHERE assigned_to = ? ORDER BY scheduled_date, scheduled_time',
      [userId]
    );
    if (result.length === 0) return [];
    return result[0].values.map(row => this.rowToTask(row));
  }

  getTasksByDate(userId: number, date: string): Task[] {
    const result = this.db.exec(
      'SELECT * FROM tasks WHERE assigned_to = ? AND scheduled_date = ? ORDER BY scheduled_time',
      [userId, date]
    );
    if (result.length === 0) return [];
    return result[0].values.map(row => this.rowToTask(row));
  }

  getTasksByCreator(createdBy: number): Task[] {
    const result = this.db.exec(
      'SELECT * FROM tasks WHERE created_by = ? ORDER BY scheduled_date DESC',
      [createdBy]
    );
    if (result.length === 0) return [];
    return result[0].values.map(row => this.rowToTask(row));
  }

  updateTask(id: number, data: UpdateTaskData): Task | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.suggested_duration !== undefined) {
      updates.push('suggested_duration = ?');
      values.push(data.suggested_duration);
    }
    if (data.scheduled_date !== undefined) {
      updates.push('scheduled_date = ?');
      values.push(data.scheduled_date);
    }
    if (data.scheduled_time !== undefined) {
      updates.push('scheduled_time = ?');
      values.push(data.scheduled_time);
    }
    if (data.points !== undefined) {
      updates.push('points = ?');
      values.push(data.points);
    }
    if (data.bonus_items !== undefined) {
      updates.push('bonus_items = ?');
      values.push(data.bonus_items);
    }
    if (data.overtime_penalty !== undefined) {
      updates.push('overtime_penalty = ?');
      values.push(data.overtime_penalty);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.review_comment !== undefined) {
      updates.push('review_comment = ?');
      values.push(data.review_comment);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      this.db.run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return this.getTaskById(id);
  }

  updateTaskStatus(id: number, status: Task['status']): Task | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const now = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

    if (status === 'in_progress' && !task.actual_start_time) {
      this.db.run(
        'UPDATE tasks SET status = ?, actual_start_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, now, id]
      );
    } else if (status === 'pending_review') {
      this.db.run(
        'UPDATE tasks SET status = ?, actual_end_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, now, id]
      );
    } else if (status === 'completed' || status === 'overtime') {
      this.db.run(
        'UPDATE tasks SET status = ?, actual_end_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, now, id]
      );
    } else {
      this.db.run(
        'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
    }

    return this.getTaskById(id);
  }

  reviewTask(id: number, approved: boolean, comment?: string): Task | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const status = approved ? 'completed' : 'rejected';

    this.db.run(
      'UPDATE tasks SET status = ?, review_comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, comment || null, id]
    );

    return this.getTaskById(id);
  }

  getPendingReviewTasks(createdBy: number): Task[] {
    const result = this.db.exec(
      `SELECT * FROM tasks WHERE created_by = ? AND status = 'pending_review' ORDER BY scheduled_date DESC`,
      [createdBy]
    );
    if (result.length === 0) return [];
    return result[0].values.map(row => this.rowToTask(row));
  }

  deleteTask(id: number): boolean {
    const task = this.getTaskById(id);
    if (!task) return false;

    this.db.run('DELETE FROM tasks WHERE id = ?', [id]);
    return true;
  }

  private rowToTask(row: any[]): Task {
    return {
      id: row[0] as number,
      title: row[1] as string,
      description: row[2] as string | undefined,
      category: row[3] as string,
      assigned_to: row[4] as number,
      created_by: row[5] as number,
      suggested_duration: row[6] as number | undefined,
      scheduled_date: row[7] as string,
      scheduled_time: row[8] as string | undefined,
      status: row[9] as Task['status'],
      review_comment: row[10] as string | undefined,
      points: row[11] as number,
      bonus_items: row[12] as string | undefined,
      overtime_penalty: row[13] as string | undefined,
      actual_start_time: row[14] as string | undefined,
      actual_end_time: row[15] as string | undefined,
      overtime_minutes: row[16] as number,
      created_at: row[17] as string,
      updated_at: row[18] as string
    };
  }
}