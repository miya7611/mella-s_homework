export interface TaskTemplate {
  id: number;
  name: string;
  category: string;
  description?: string;
  suggested_duration?: number;
  points?: number;
  created_by: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateTemplateData {
  name: string;
  category: string;
  description?: string;
  suggested_duration?: number;
  points?: number;
}

export interface UpdateTemplateData {
  name?: string;
  category?: string;
  description?: string;
  suggested_duration?: number;
  points?: number;
  is_active?: boolean;
}
