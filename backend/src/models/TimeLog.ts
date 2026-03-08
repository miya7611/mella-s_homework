export interface TimeLog {
  id: number;
  task_id: number;
  user_id: number;
  start_time: string;
  end_time: string | null;
  duration: number;
  is_overtime: boolean;
  notes?: string;
  created_at: string;
}

export interface CreateTimeLogData {
  task_id: number;
  start_time: string;
  notes?: string;
}

export interface UpdateTimeLogData {
  end_time?: string;
  notes?: string;
}
