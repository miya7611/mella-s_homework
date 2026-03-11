import { Tag, CreateTagData, TaskTag } from '../models/Tag';
import { Database } from 'sql.js';

export class TagService {
  constructor(private db: Database) {}

  // Create a new tag
  createTag(data: CreateTagData, createdBy: number): Tag | null {
    try {
      this.db.run(
        'INSERT INTO tags (name, color, created_by) VALUES (?, ?, ?)',
        [data.name, data.color || '#6366f1', createdBy]
      );

      const result = this.db.exec('SELECT * FROM tags WHERE id = last_insert_rowid()');
      if (result.length === 0 || result[0].values.length === 0) {
        return null;
      }
      return this.rowToTag(result[0].values[0]);
    } catch {
      return null;
    }
  }

  // Get tag by ID
  getTagById(id: number): Tag | null {
    const result = this.db.exec('SELECT * FROM tags WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }
    return this.rowToTag(result[0].values[0]);
  }

  // Get all tags created by a user
  getTagsByUser(userId: number): Tag[] {
    const result = this.db.exec(
      'SELECT * FROM tags WHERE created_by = ? ORDER BY name',
      [userId]
    );
    if (result.length === 0) return [];
    return result[0].values.map(row => this.rowToTag(row));
  }

  // Get tags for a specific task
  getTagsForTask(taskId: number): Tag[] {
    const result = this.db.exec(
      `SELECT t.* FROM tags t
       INNER JOIN task_tags tt ON t.id = tt.tag_id
       WHERE tt.task_id = ?
       ORDER BY t.name`,
      [taskId]
    );
    if (result.length === 0) return [];
    return result[0].values.map(row => this.rowToTag(row));
  }

  // Add tag to task
  addTagToTask(taskId: number, tagId: number): boolean {
    try {
      this.db.run(
        'INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)',
        [taskId, tagId]
      );
      return true;
    } catch {
      return false;
    }
  }

  // Remove tag from task
  removeTagFromTask(taskId: number, tagId: number): boolean {
    try {
      this.db.run(
        'DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?',
        [taskId, tagId]
      );
      return true;
    } catch {
      return false;
    }
  }

  // Set all tags for a task (replaces existing)
  setTaskTags(taskId: number, tagIds: number[]): void {
    // Remove existing tags
    this.db.run('DELETE FROM task_tags WHERE task_id = ?', [taskId]);

    // Add new tags
    for (const tagId of tagIds) {
      this.db.run(
        'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
        [taskId, tagId]
      );
    }
  }

  // Get tasks by tag
  getTasksByTag(tagId: number): number[] {
    const result = this.db.exec(
      'SELECT task_id FROM task_tags WHERE tag_id = ?',
      [tagId]
    );
    if (result.length === 0) return [];
    return result[0].values.map(row => row[0] as number);
  }

  // Update tag
  updateTag(id: number, data: Partial<CreateTagData>): Tag | null {
    const tag = this.getTagById(id);
    if (!tag) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.color !== undefined) {
      updates.push('color = ?');
      values.push(data.color);
    }

    if (updates.length > 0) {
      values.push(id);
      this.db.run(`UPDATE tags SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return this.getTagById(id);
  }

  // Delete tag
  deleteTag(id: number): boolean {
    const tag = this.getTagById(id);
    if (!tag) return false;

    // Remove all task associations first
    this.db.run('DELETE FROM task_tags WHERE tag_id = ?', [id]);

    // Delete the tag
    this.db.run('DELETE FROM tags WHERE id = ?', [id]);
    return true;
  }

  private rowToTag(row: any[]): Tag {
    return {
      id: row[0] as number,
      name: row[1] as string,
      color: row[2] as string,
      created_by: row[3] as number,
      created_at: row[4] as string,
    };
  }
}
