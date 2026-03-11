import { Router } from 'express';
import { AttachmentService } from '../services/attachmentService';
import { TaskService } from '../services/taskService';
import { getDatabase, saveDatabase } from '../database/connection';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router({ mergeParams: true });

const getAttachmentService = () => new AttachmentService(getDatabase());
const getTaskService = () => new TaskService(getDatabase());

// Maximum file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Get attachments for a task (metadata only)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const attachmentService = getAttachmentService();
    const taskId = Number(req.params.taskId);
    const attachments = attachmentService.getAttachmentMetadataByTask(taskId);

    res.json({
      success: true,
      data: attachments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Get a single attachment with content (for download)
router.get('/:attachmentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const attachmentService = getAttachmentService();
    const attachmentId = Number(req.params.attachmentId);
    const attachment = attachmentService.getAttachmentById(attachmentId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '附件不存在' }
      });
    }

    res.json({
      success: true,
      data: attachment
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Upload an attachment
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { file_name, file_type, file_size, content } = req.body;

    if (!file_name || !file_name.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '文件名不能为空' }
      });
    }

    if (file_size && file_size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: '文件大小不能超过2MB' }
      });
    }

    const attachmentService = getAttachmentService();
    const taskService = getTaskService();
    const taskId = Number(req.params.taskId);

    // Verify task exists
    const task = taskService.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '任务不存在' }
      });
    }

    const attachment = attachmentService.createAttachment(taskId, req.user!.userId, {
      file_name: file_name.trim(),
      file_type,
      file_size,
      content,
    });

    if (!attachment) {
      return res.status(400).json({
        success: false,
        error: { code: 'CREATE_FAILED', message: '附件上传失败' }
      });
    }

    saveDatabase();

    // Return without content for list view
    const { content: _, ...metadata } = attachment;
    res.status(201).json({
      success: true,
      data: metadata
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    });
  }
});

// Delete an attachment
router.delete('/:attachmentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const attachmentService = getAttachmentService();
    const attachmentId = Number(req.params.attachmentId);
    const attachment = attachmentService.getAttachmentById(attachmentId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '附件不存在' }
      });
    }

    // Only uploader can delete
    if (attachment.uploaded_by !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: '无权删除此附件' }
      });
    }

    attachmentService.deleteAttachment(attachmentId);
    saveDatabase();

    res.json({
      success: true,
      message: '附件已删除'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message }
    });
  }
});

export default router;
