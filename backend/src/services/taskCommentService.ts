import { Database } from 'sql.js';
import type { TaskComment, CreateCommentData } from '../models/TaskComment';

export class TaskCommentService {
  constructor(private db: Database) {}

  createComment(taskId: number, userId: number, data: CreateCommentData): TaskComment {
    this.db.run(
      'INSERT INTO task_comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [taskId, userId, data.content]
    );

    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0] as number;

    return this.getCommentById(id)!;
  }

  getCommentById(id: number): TaskComment | null {
    const result = this.db.exec(
      'SELECT * FROM task_comments WHERE id = ?',
      [id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.rowToComment(result[0].values[0]);
  }

  getCommentsByTask(taskId: number): TaskComment[] {
    const result = this.db.exec(
      `SELECT c.*, u.username, u.avatar
       FROM task_comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.task_id = ?
       ORDER BY c.created_at DESC`,
      [taskId]
    );

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map(row => ({
      ...this.rowToComment(row),
      username: row[5] as string,
      avatar: row[6] as string
    }));
  }

  deleteComment(id: number): boolean {
    this.db.run('DELETE FROM task_comments WHERE id = ?', [id]);

    const result = this.db.exec('SELECT changes()');
    return (result[0].values[0][0] as number) > 0;
  }

  private rowToComment(row: any[]): TaskComment {
    return {
      id: row[0] as number,
      task_id: row[1] as number,
      user_id: row[2] as number,
      content: row[3] as string,
      created_at: row[4] as string
    };
  }
}
