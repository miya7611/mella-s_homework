export interface Notification {
  id: number;
  user_id: number;
  type: 'task_due' | 'task_overdue' | 'new_comment' | 'task_assigned' | 'task_completed' | 'points_earned';
  title: string;
  message: string;
  data?: string; // JSON string for additional data
  is_read: boolean;
  created_at: string;
}

export type NotificationType = Notification['type'];

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}
