export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  in_progress: number;
  overtime: number;
}

export interface DailyStats {
  date: string;
  tasks_completed: number;
  points_earned: number;
  time_spent: number;
}

export interface UserStats {
  total_tasks: number;
  completed_tasks: number;
  total_points: number;
  points_earned: number;
  points_spent: number;
  total_time_minutes: number;
  daily_stats: DailyStats[];
  task_stats: TaskStats;
}
