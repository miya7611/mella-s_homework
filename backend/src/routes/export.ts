import { Router } from 'express';
import { ExportService } from '../services/exportService';
import { getDatabase } from '../database/connection';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const getExportService = () => new ExportService(getDatabase());

// Export all user data as JSON
router.get('/json', authenticate, async (req: AuthRequest, res) => {
  try {
    const exportService = getExportService();
    const data = exportService.exportUserData(req.user!.userId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="homework-data-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'EXPORT_FAILED', message: error.message }
    });
  }
});

// Export tasks as CSV
router.get('/tasks/csv', authenticate, async (req: AuthRequest, res) => {
  try {
    const exportService = getExportService();
    const csv = exportService.exportTasksCSV(req.user!.userId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="tasks-${new Date().toISOString().split('T')[0]}.csv"`);
    // Add BOM for Excel UTF-8 compatibility
    res.send('\ufeff' + csv);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'EXPORT_FAILED', message: error.message }
    });
  }
});

// Export time logs as CSV
router.get('/time-logs/csv', authenticate, async (req: AuthRequest, res) => {
  try {
    const exportService = getExportService();
    const csv = exportService.exportTimeLogsCSV(req.user!.userId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="time-logs-${new Date().toISOString().split('T')[0]}.csv"`);
    // Add BOM for Excel UTF-8 compatibility
    res.send('\ufeff' + csv);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'EXPORT_FAILED', message: error.message }
    });
  }
});

export default router;
