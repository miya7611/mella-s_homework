export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  username?: string;
  avatar?: string;
}

export interface CreateCommentData {
  content: string;
}
