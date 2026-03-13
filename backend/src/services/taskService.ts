import { Task, CreateTaskData, UpdateTaskData, RepeatType, RepeatConfig, Priority } from '../models/Task';
import { Database } from 'sql.js';

export class TaskService {
  constructor(private db: Database) {}

  createTask(data: CreateTaskData, createdBy: number): Task {
    const repeatConfigJson = data.repeat_config ? JSON.stringify(data.repeat_config) : null;

    this.db.run(
      `INSERT INTO tasks (
        title, description, category, assigned_to, created_by,
        suggested_duration, scheduled_date, scheduled_time,
        points, bonus_items, overtime_penalty, status, repeat_type, repeat_config, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
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
        data.overtime_penalty || null,
        data.repeat_type || 'none',
        repeatConfigJson,
        data.priority || 'medium'
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

  getUpcomingTasks(userId: number, days: number = 3): Task[] {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const result = this.db.exec(
      `SELECT * FROM tasks
       WHERE assigned_to = ?
       AND status NOT IN ('completed', 'rejected')
       AND scheduled_date >= ?
       AND scheduled_date <= ?
       ORDER BY scheduled_date, scheduled_time`,
      [userId, today, futureDateStr]
    );

    if (result.length === 0) return [];
    return result[0].values.map(row => this.rowToTask(row));
  }

  getOverdueTasks(userId: number): Task[] {
    const today = new Date().toISOString().split('T')[0];

    const result = this.db.exec(
      `SELECT * FROM tasks
       WHERE assigned_to = ?
       AND status NOT IN ('completed', 'rejected')
       AND scheduled_date < ?
       ORDER BY scheduled_date`,
      [userId, today]
    );

    if (result.length === 0) return [];
    return result[0].values.map(row => this.rowToTask(row));
  }

  getDueTodayTasks(userId: number): Task[] {
    const today = new Date().toISOString().split('T')[0];

    const result = this.db.exec(
      `SELECT * FROM tasks
       WHERE assigned_to = ?
       AND status NOT IN ('completed', 'rejected')
       AND scheduled_date = ?
       ORDER BY scheduled_time`,
      [userId, today]
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

  // Search tasks with filters
  searchTasks(params: {
    userId?: number;
    query?: string;
    status?: string[];
    priority?: string[];
    category?: string[];
    dateFrom?: string;
    dateTo?: string;
    createdBy?: number;
  }): Task[] {
    const conditions: string[] = [];
    const values: any[] = [];

    // User filter (assigned_to or created_by)
    if (params.userId) {
      conditions.push('(assigned_to = ? OR created_by = ?)');
      values.push(params.userId, params.userId);
    }

    // Text search in title and description
    if (params.query && params.query.trim()) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      const searchTerm = `%${params.query.trim()}%`;
      values.push(searchTerm, searchTerm);
    }

    // Status filter
    if (params.status && params.status.length > 0) {
      const placeholders = params.status.map(() => '?').join(', ');
      conditions.push(`status IN (${placeholders})`);
      values.push(...params.status);
    }

    // Priority filter
    if (params.priority && params.priority.length > 0) {
      const placeholders = params.priority.map(() => '?').join(', ');
      conditions.push(`priority IN (${placeholders})`);
      values.push(...params.priority);
    }

    // Category filter
    if (params.category && params.category.length > 0) {
      const placeholders = params.category.map(() => '?').join(', ');
      conditions.push(`category IN (${placeholders})`);
      values.push(...params.category);
    }

    // Date range filter
    if (params.dateFrom) {
      conditions.push('scheduled_date >= ?');
      values.push(params.dateFrom);
    }
    if (params.dateTo) {
      conditions.push('scheduled_date <= ?');
      values.push(params.dateTo);
    }

    // Created by filter
    if (params.createdBy) {
      conditions.push('created_by = ?');
      values.push(params.createdBy);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM tasks ${whereClause} ORDER BY scheduled_date DESC, scheduled_time DESC`;

    const result = this.db.exec(sql, values);
    if (result.length === 0) return [];
    return result[0].values.map(row => this.rowToTask(row));
  }

  deleteTask(id: number): boolean {
    const task = this.getTaskById(id);
    if (!task) return false;

    this.db.run('DELETE FROM tasks WHERE id = ?', [id]);
    return true;
  }

  // Subtask methods
  getSubtasks(parentTaskId: number): Task[] {
    const result = this.db.exec(
      'SELECT * FROM tasks WHERE parent_task_id = ? ORDER BY created_at ASC',
      [parentTaskId]
    );
    if (result.length === 0) return [];
    return result[0].values.map(row => this.rowToTask(row));
  }

  createSubtask(parentTaskId: number, data: CreateTaskData, createdBy: number): Task | null {
    const parentTask = this.getTaskById(parentTaskId);
    if (!parentTask) return null;

    const task = this.createTask({
      ...data,
      assigned_to: data.assigned_to || parentTask.assigned_to,
      scheduled_date: data.scheduled_date || parentTask.scheduled_date,
    }, createdBy);

    // Set parent task id
    this.db.run(
      'UPDATE tasks SET parent_task_id = ? WHERE id = ?',
      [parentTaskId, task.id]
    );

    return this.getTaskById(task.id);
  }

  updateSubtaskStatus(subtaskId: number, status: Task['status']): Task | null {
    return this.updateTaskStatus(subtaskId, status);
  }

  deleteSubtask(subtaskId: number): boolean {
    return this.deleteTask(subtaskId);
  }

  getSubtaskProgress(parentTaskId: number): { total: number; completed: number; percentage: number } {
    const subtasks = this.getSubtasks(parentTaskId);
    const total = subtasks.length;
    const completed = subtasks.filter(t => t.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }

  createRecurringTask(taskId: number): Task | null {
    const task = this.getTaskById(taskId);
    if (!task || task.repeat_type === 'none') return null;

    const nextDate = this.getNextRecurringDate(task.scheduled_date, task.repeat_type);
    if (!nextDate) return null;

    // Check if config limits are exceeded
    if (task.repeat_config) {
      const config: RepeatConfig = JSON.parse(task.repeat_config);
      if (config.endDate && nextDate > config.endDate) return null;
    }

    const newTask = this.createTask({
      title: task.title,
      description: task.description,
      category: task.category,
      assigned_to: task.assigned_to,
      suggested_duration: task.suggested_duration,
      scheduled_date: nextDate,
      scheduled_time: task.scheduled_time,
      points: task.points,
      bonus_items: task.bonus_items,
      overtime_penalty: task.overtime_penalty,
      repeat_type: task.repeat_type,
      repeat_config: task.repeat_config ? JSON.parse(task.repeat_config) : undefined
    }, task.created_by);

    // Set parent task id
    this.db.run(
      'UPDATE tasks SET parent_task_id = ? WHERE id = ?',
      [taskId, newTask.id]
    );

    return this.getTaskById(newTask.id);
  }

  private getNextRecurringDate(currentDate: string, repeatType: RepeatType): string | null {
    const date = new Date(currentDate);

    switch (repeatType) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        return null;
    }

    return date.toISOString().split('T')[0];
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
      priority: (row[10] as string || 'medium') as Priority,
      review_comment: row[11] as string | undefined,
      points: row[12] as number,
      bonus_items: row[13] as string | undefined,
      overtime_penalty: row[14] as string | undefined,
      actual_start_time: row[15] as string | undefined,
      actual_end_time: row[16] as string | undefined,
      overtime_minutes: row[17] as number,
      repeat_type: (row[18] as string || 'none') as RepeatType,
      repeat_config: row[19] as string | undefined,
      parent_task_id: row[20] as number | undefined,
      created_at: row[21] as string,
      updated_at: row[22] as string
    };
  }
}