import { Database } from 'sql.js';
import { TaskService } from './taskService';
import { TimeService } from './timeService';

export class ExportService {
  constructor(private db: Database) {}

  // Export user's data as JSON
  exportUserData(userId: number): object {
    const taskService = new TaskService(this.db);
    const timeService = new TimeService(this.db);

    // Get user info
    const userResult = this.db.exec(
      'SELECT id, username, role, avatar, level, total_points, created_at FROM users WHERE id = ?',
      [userId]
    );
    const user = userResult.length > 0 && userResult[0].values.length > 0
      ? {
          id: userResult[0].values[0][0],
          username: userResult[0].values[0][1],
          role: userResult[0].values[0][2],
          avatar: userResult[0].values[0][3],
          level: userResult[0].values[0][4],
          total_points: userResult[0].values[0][5],
          created_at: userResult[0].values[0][6],
        }
      : null;

    // Get tasks
    const tasks = taskService.getTasksByUser(userId);

    // Get time logs for each task
    const timeLogs: any[] = [];
    for (const task of tasks) {
      const logs = timeService.getTimeLogsByTaskId(task.id);
      timeLogs.push(...logs.map((log: any) => ({ ...log, task_title: task.title })));
    }

    // Get badges
    const badgesResult = this.db.exec(
      'SELECT badge_type, earned_at FROM badges WHERE user_id = ?',
      [userId]
    );
    const badges = badgesResult.length > 0
      ? badgesResult[0].values.map(row => ({
          badge_type: row[0],
          earned_at: row[1],
        }))
      : [];

    // Get rewards
    const rewardsResult = this.db.exec(
      'SELECT type, amount, item_name, description, created_at FROM rewards WHERE user_id = ?',
      [userId]
    );
    const rewards = rewardsResult.length > 0
      ? rewardsResult[0].values.map(row => ({
          type: row[0],
          amount: row[1],
          item_name: row[2],
          description: row[3],
          created_at: row[4],
        }))
      : [];

    return {
      export_date: new Date().toISOString(),
      user,
      tasks,
      time_logs: timeLogs,
      badges,
      rewards,
      statistics: {
        total_tasks: tasks.length,
        completed_tasks: tasks.filter(t => t.status === 'completed').length,
        total_points_earned: user?.total_points || 0,
        total_time_spent: timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0),
      },
    };
  }

  // Export tasks as CSV
  exportTasksCSV(userId: number): string {
    const taskService = new TaskService(this.db);
    const tasks = taskService.getTasksByUser(userId);

    // CSV headers
    const headers = [
      'ID',
      '标题',
      '描述',
      '分类',
      '状态',
      '优先级',
      '计划日期',
      '计划时间',
      '预计时长',
      '积分',
      '实际开始时间',
      '实际结束时间',
      '创建时间',
    ];

    // CSV rows
    const rows = tasks.map(task => [
      task.id,
      this.escapeCSV(task.title),
      this.escapeCSV(task.description || ''),
      task.category,
      task.status,
      task.priority,
      task.scheduled_date,
      task.scheduled_time || '',
      task.suggested_duration?.toString() || '',
      task.points.toString(),
      task.actual_start_time || '',
      task.actual_end_time || '',
      task.created_at,
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
  }

  // Export time logs as CSV
  exportTimeLogsCSV(userId: number): string {
    const taskService = new TaskService(this.db);
    const timeService = new TimeService(this.db);

    const tasks = taskService.getTasksByUser(userId);
    const allLogs: any[] = [];

    for (const task of tasks) {
      const logs = timeService.getTimeLogsByTaskId(task.id);
      allLogs.push(...logs.map((log: any) => ({ ...log, task_title: task.title })));
    }

    // CSV headers
    const headers = [
      'ID',
      '任务ID',
      '任务标题',
      '开始时间',
      '结束时间',
      '时长(分钟)',
      '是否超时',
      '备注',
    ];

    // CSV rows
    const rows = allLogs.map(log => [
      log.id,
      log.task_id,
      this.escapeCSV(log.task_title),
      log.start_time,
      log.end_time || '',
      log.duration?.toString() || '',
      log.is_overtime ? '是' : '否',
      this.escapeCSV(log.notes || ''),
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
