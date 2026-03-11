export interface Tag {
  id: number;
  name: string;
  color: string;
  created_by: number;
  created_at: string;
}

export interface CreateTagData {
  name: string;
  color?: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
}
