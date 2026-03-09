import { Router } from 'express';
import { TaskTemplateService } from '../services/taskTemplateService';
import { getDatabase } from '../database/connection';
import { authenticate, requireParent, AuthRequest } from '../middleware/auth';

const router = Router();

const getTemplateService = () => new TaskTemplateService(getDatabase());

// Get all templates for current user
router.get('/', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const templateService = getTemplateService();
    const userId = req.user!.userId;
    const templates = templateService.getTemplatesByUser(userId);

    res.json({
      success: true,
      data: templates
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Get template by id
router.get('/:id', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const templateService = getTemplateService();
    const id = Number(req.params.id);
    const template = templateService.getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '模板不存在' }
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Create new template
router.post('/', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const templateService = getTemplateService();
    const userId = req.user!.userId;
    const template = templateService.createTemplate(req.body, userId);

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_FAILED', message: error.message }
    });
  }
});

// Update template
router.put('/:id', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const templateService = getTemplateService();
    const id = Number(req.params.id);
    const template = templateService.updateTemplate(id, req.body);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '模板不存在' }
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message }
    });
  }
});

// Delete template
router.delete('/:id', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const templateService = getTemplateService();
    const id = Number(req.params.id);
    const deleted = templateService.deleteTemplate(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '模板不存在' }
      });
    }

    res.json({
      success: true,
      message: '模板已删除'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message }
    });
  }
});

export default router;
