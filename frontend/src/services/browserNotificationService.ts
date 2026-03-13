import { useNotificationSettingsStore } from '../stores/notificationSettingsStore';

class BrowserNotificationService {
  private checkInterval: number | null = null;

  // Check if browser notifications are supported
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Request permission for notifications
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Browser notifications are not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    useNotificationSettingsStore.getState().setPermissionGranted(granted);
    return granted;
  }

  // Show a notification
  show(title: string, options?: NotificationOptions): Notification | null {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return null;
    }

    const settings = useNotificationSettingsStore.getState().settings;
    if (!settings.enabled) {
      return null;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options?.data?.url) {
        window.location.href = options.data.url;
      }
    };

    return notification;
  }

  // Show task due reminder notification
  showTaskDueReminder(taskTitle: string, dueTime: string, taskId: number): Notification | null {
    const settings = useNotificationSettingsStore.getState().settings;
    if (!settings.taskDueReminder) return null;

    return this.show(`任务即将到期: ${taskTitle}`, {
      body: `截止时间: ${dueTime}`,
      tag: `task-due-${taskId}`,
      data: { url: `/tasks/${taskId}` },
    });
  }

  // Show task overdue notification
  showTaskOverdue(taskTitle: string, taskId: number): Notification | null {
    const settings = useNotificationSettingsStore.getState().settings;
    if (!settings.taskOverdue) return null;

    return this.show(`任务已超时: ${taskTitle}`, {
      body: '请尽快完成任务',
      tag: `task-overdue-${taskId}`,
      data: { url: `/tasks/${taskId}` },
    });
  }

  // Show task assigned notification
  showTaskAssigned(taskTitle: string, dueDate: string, taskId: number): Notification | null {
    const settings = useNotificationSettingsStore.getState().settings;
    if (!settings.taskAssigned) return null;

    return this.show(`新任务分配: ${taskTitle}`, {
      body: `截止日期: ${dueDate}`,
      tag: `task-assigned-${taskId}`,
      data: { url: `/tasks/${taskId}` },
    });
  }

  // Show task completed notification
  showTaskCompleted(taskTitle: string, points: number): Notification | null {
    const settings = useNotificationSettingsStore.getState().settings;
    if (!settings.taskCompleted) return null;

    return this.show(`任务审核通过: ${taskTitle}`, {
      body: `获得 ${points} 积分`,
      tag: `task-completed-${Date.now()}`,
    });
  }

  // Show points earned notification
  showPointsEarned(points: number, reason: string): Notification | null {
    const settings = useNotificationSettingsStore.getState().settings;
    if (!settings.pointsEarned) return null;

    return this.show(`获得积分: +${points}`, {
      body: reason,
      tag: `points-earned-${Date.now()}`,
    });
  }

  // Start periodic check for upcoming tasks
  startTaskReminderCheck(checkCallback: () => void, intervalMinutes: number = 5) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check immediately
    checkCallback();

    // Then check periodically
    this.checkInterval = window.setInterval(checkCallback, intervalMinutes * 60 * 1000);
  }

  // Stop periodic check
  stopTaskReminderCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const browserNotificationService = new BrowserNotificationService();
