export type NotificationType =
  | 'task_due'
  | 'task_overdue'
  | 'new_comment'
  | 'task_assigned'
  | 'task_completed'
  | 'points_earned';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: string;
  is_read: boolean;
  created_at: string;
}

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  task_due: '⏰',
  task_overdue: '🚨',
  new_comment: '💬',
  task_assigned: '📋',
  task_completed: '✅',
  points_earned: '⭐',
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  task_due: 'text-orange-500',
  task_overdue: 'text-red-500',
  new_comment: 'text-blue-500',
  task_assigned: 'text-purple-500',
  task_completed: 'text-green-500',
  points_earned: 'text-yellow-500',
};
