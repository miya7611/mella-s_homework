import { Attachment, CreateAttachmentData } from '../models/Attachment';
import { Database } from 'sql.js';

// Maximum file size: 2MB (as base64, this is ~1.5MB original)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export class AttachmentService {
  constructor(private db: Database) {}

  // Create a new attachment
  createAttachment(taskId: number, userId: number, data: CreateAttachmentData): Attachment | null {
    // Check file size
    if (data.file_size && data.file_size > MAX_FILE_SIZE) {
      return null;
    }

    try {
      this.db.run(
        `INSERT INTO task_attachments (task_id, file_name, file_type, file_size, content, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [taskId, data.file_name, data.file_type || null, data.file_size || null, data.content || null, userId]
      );

      const result = this.db.exec('SELECT * FROM task_attachments WHERE id = last_insert_rowid()');
      if (result.length === 0 || result[0].values.length === 0) {
        return null;
      }
      return this.rowToAttachment(result[0].values[0]);
    } catch {
      return null;
    }
  }

  // Get attachment by ID
  getAttachmentById(id: number): Attachment | null {
    const result = this.db.exec('SELECT * FROM task_attachments WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }
    return this.rowToAttachment(result[0].values[0]);
  }

  // Get all attachments for a task
  getAttachmentsByTask(taskId: number): Attachment[] {
    const result = this.db.exec(
      'SELECT * FROM task_attachments WHERE task_id = ? ORDER BY created_at DESC',
      [taskId]
    );
    if (result.length === 0) return [];
    return result[0].values.map(row => this.rowToAttachment(row));
  }

  // Get attachment metadata (without content) for a task
  getAttachmentMetadataByTask(taskId: number): Omit<Attachment, 'content'>[] {
    const result = this.db.exec(
      'SELECT id, task_id, file_name, file_type, file_size, uploaded_by, created_at FROM task_attachments WHERE task_id = ? ORDER BY created_at DESC',
      [taskId]
    );
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
      id: row[0] as number,
      task_id: row[1] as number,
      file_name: row[2] as string,
      file_type: row[3] as string | undefined,
      file_size: row[4] as number | undefined,
      uploaded_by: row[5] as number,
      created_at: row[6] as string,
    }));
  }

  // Delete an attachment
  deleteAttachment(id: number): boolean {
    const attachment = this.getAttachmentById(id);
    if (!attachment) return false;

    this.db.run('DELETE FROM task_attachments WHERE id = ?', [id]);
    return true;
  }

  // Delete all attachments for a task
  deleteAttachmentsByTask(taskId: number): void {
    this.db.run('DELETE FROM task_attachments WHERE task_id = ?', [taskId]);
  }

  private rowToAttachment(row: any[]): Attachment {
    return {
      id: row[0] as number,
      task_id: row[1] as number,
      file_name: row[2] as string,
      file_type: row[3] as string | undefined,
      file_size: row[4] as number | undefined,
      content: row[5] as string | undefined,
      uploaded_by: row[6] as number,
      created_at: row[7] as string,
    };
  }
}
