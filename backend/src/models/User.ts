export interface User {
  id: number;
  username: string;
  password: string;
  role: 'parent' | 'child';
  avatar?: string;
  level: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  role: 'parent' | 'child';
  avatar?: string;
}

export interface LoginData {
  username: string;
  password: string;
}