export type TaskStatus = 'pending' | 'planned' | 'in_progress' | 'pending_review' | 'completed' | 'rejected' | 'overtime';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface RepeatConfig {
  endDate?: string; // 结束日期
  daysOfWeek?: number[]; // 每周重复的日期 (0-6, 0=周日)
  dayOfMonth?: number; // 每月重复的日期 (1-31)
  maxOccurrences?: number; // 最大重复次数
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  category: string;
  assigned_to: number;
  created_by: number;
  suggested_duration?: number;
  scheduled_date: string;
  scheduled_time?: string;
  status: TaskStatus;
  review_comment?: string;
  points: number;
  bonus_items?: string;
  overtime_penalty?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  overtime_minutes: number;
  repeat_type: RepeatType;
  repeat_config?: string; // JSON string
  parent_task_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  category: string;
  assigned_to: number;
  suggested_duration?: number;
  scheduled_date: string;
  scheduled_time?: string;
  points: number;
  bonus_items?: string;
  overtime_penalty?: string;
  repeat_type?: RepeatType;
  repeat_config?: RepeatConfig;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  category?: string;
  suggested_duration?: number;
  scheduled_date?: string;
  scheduled_time?: string;
  points?: number;
  bonus_items?: string;
  overtime_penalty?: string;
  status?: TaskStatus;
  review_comment?: string;
}