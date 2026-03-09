import { Database } from 'sql.js';
import type { TaskTemplate, CreateTemplateData, UpdateTemplateData } from '../models/TaskTemplate';

export class TaskTemplateService {
  constructor(private db: Database) {}

  createTemplate(data: CreateTemplateData, createdBy: number): TaskTemplate {
    this.db.run(
      `INSERT INTO task_templates (name, description, category, suggested_duration, points, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name, data.description || null, data.category, data.suggested_duration || null, data.points || 0, createdBy]
    );

    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0] as number;

    return this.getTemplateById(id)!;
  }

  getTemplateById(id: number): TaskTemplate | null {
    const result = this.db.exec(
      'SELECT * FROM task_templates WHERE id = ?',
      [id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.rowToTemplate(result[0].values[0]);
  }

  getTemplatesByUser(userId: number): TaskTemplate[] {
    const result = this.db.exec(
      'SELECT * FROM task_templates WHERE created_by = ? AND is_active = 1 ORDER BY created_at DESC',
      [userId]
    );

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map(row => this.rowToTemplate(row));
  }

  updateTemplate(id: number, data: UpdateTemplateData): TaskTemplate | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.category !== undefined) {
      fields.push('category = ?');
      values.push(data.category);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.suggested_duration !== undefined) {
      fields.push('suggested_duration = ?');
      values.push(data.suggested_duration);
    }
    if (data.points !== undefined) {
      fields.push('points = ?');
      values.push(data.points);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
    }

    if (fields.length === 0) {
      return this.getTemplateById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    this.db.run(
      `UPDATE task_templates SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.getTemplateById(id);
  }

  deleteTemplate(id: number): boolean {
    // Soft delete by setting is_active = 0
    this.db.run(
      'UPDATE task_templates SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    const result = this.db.exec('SELECT changes()');
    return (result[0].values[0][0] as number) > 0;
  }

  private rowToTemplate(row: any[]): TaskTemplate {
    return {
      id: row[0] as number,
      name: row[1] as string,
      description: row[2] as string | undefined,
      category: row[3] as string,
      suggested_duration: row[4] as number | undefined,
      points: row[5] as number,
      created_by: row[6] as number,
      is_active: row[7] === 1,
      created_at: row[8] as string
    };
  }
}
