import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores';
import { useNotificationSettingsStore } from '../stores/notificationSettingsStore';
import { browserNotificationService } from '../services/browserNotificationService';
import { taskApi } from '../api/task.api';

export function useTaskReminders() {
  const { user } = useAuthStore();
  const { settings, permissionGranted } = useNotificationSettingsStore();

  const checkUpcomingTasks = useCallback(async () => {
    if (!user || !permissionGranted || !settings.enabled || !settings.taskDueReminder) {
      return;
    }

    try {
      // Get upcoming tasks (due within the reminder period)
      const reminderMinutes = settings.taskDueReminderMinutes;
      const tasks = await taskApi.getUpcomingTasks(Math.ceil(reminderMinutes / 60 / 24) + 1);

      const now = new Date();

      for (const task of tasks) {
        if (task.status === 'completed' || task.status === 'rejected') continue;

        const dueDate = new Date(task.scheduled_date);
        if (task.scheduled_time) {
          const [hours, minutes] = task.scheduled_time.split(':').map(Number);
          dueDate.setHours(hours, minutes, 0, 0);
        }

        const timeDiff = dueDate.getTime() - now.getTime();
        const minutesUntilDue = Math.floor(timeDiff / (1000 * 60));

        // Check if task is due within the reminder period
        if (minutesUntilDue > 0 && minutesUntilDue <= reminderMinutes) {
          const dueTimeStr = task.scheduled_time || '今天';
          browserNotificationService.showTaskDueReminder(task.title, dueTimeStr, task.id);
        }

        // Check if task is overdue
        if (minutesUntilDue < 0) {
          browserNotificationService.showTaskOverdue(task.title, task.id);
        }
      }
    } catch (error) {
      console.error('Failed to check upcoming tasks:', error);
    }
  }, [user, permissionGranted, settings]);

  useEffect(() => {
    if (!permissionGranted || !settings.enabled) {
      return;
    }

    // Check immediately
    checkUpcomingTasks();

    // Check every 5 minutes
    const interval = setInterval(checkUpcomingTasks, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkUpcomingTasks, permissionGranted, settings.enabled]);

  // Check permission on mount
  useEffect(() => {
    const status = browserNotificationService.getPermissionStatus();
    useNotificationSettingsStore.getState().setPermissionGranted(status === 'granted');
  }, []);
}
