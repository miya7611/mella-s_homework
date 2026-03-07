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
  status: 'pending' | 'planned' | 'in_progress' | 'completed' | 'overtime';
  points: number;
  bonus_items?: string;
  overtime_penalty?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  overtime_minutes: number;
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
  status?: 'pending' | 'planned' | 'in_progress' | 'completed' | 'overtime';
}