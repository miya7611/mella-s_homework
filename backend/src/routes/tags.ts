import { Router } from 'express';
import { TagService } from '../services/tagService';
import { getDatabase, saveDatabase } from '../database/connection';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const getTagService = () => new TagService(getDatabase());

// Get all tags for current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const tagService = getTagService();
    const tags = tagService.getTagsByUser(req.user!.userId);

    res.json({
      success: true,
      data: tags
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Get tags for a specific task
router.get('/task/:taskId', authenticate, async (req: AuthRequest, res) => {
  try {
    const tagService = getTagService();
    const taskId = Number(req.params.taskId);
    const tags = tagService.getTagsForTask(taskId);

    res.json({
      success: true,
      data: tags
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Create a new tag
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '标签名称不能为空' }
      });
    }

    const tagService = getTagService();
    const tag = tagService.createTag(
      { name: name.trim(), color },
      req.user!.userId
    );

    if (!tag) {
      return res.status(400).json({
        success: false,
        error: { code: 'CREATE_FAILED', message: '标签已存在或创建失败' }
      });
    }

    saveDatabase();

    res.status(201).json({
      success: true,
      data: tag
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    });
  }
});

// Update a tag
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, color } = req.body;
    const tagService = getTagService();
    const tag = tagService.getTagById(Number(req.params.id));

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '标签不存在' }
      });
    }

    // Only creator can update
    if (tag.created_by !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: '无权修改此标签' }
      });
    }

    const updatedTag = tagService.updateTag(Number(req.params.id), { name, color });
    saveDatabase();

    res.json({
      success: true,
      data: updatedTag
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    });
  }
});

// Delete a tag
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const tagService = getTagService();
    const tag = tagService.getTagById(Number(req.params.id));

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '标签不存在' }
      });
    }

    // Only creator can delete
    if (tag.created_by !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: '无权删除此标签' }
      });
    }

    tagService.deleteTag(Number(req.params.id));
    saveDatabase();

    res.json({
      success: true,
      message: '标签已删除'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message }
    });
  }
});

// Set tags for a task
router.post('/task/:taskId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { tagIds } = req.body;

    if (!Array.isArray(tagIds)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'tagIds 必须是数组' }
      });
    }

    const tagService = getTagService();
    const taskId = Number(req.params.taskId);

    tagService.setTaskTags(taskId, tagIds);
    saveDatabase();

    const tags = tagService.getTagsForTask(taskId);

    res.json({
      success: true,
      data: tags
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    });
  }
});

export default router;
