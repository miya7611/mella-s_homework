export type UserRole = 'parent' | 'child';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  avatar?: string;
  level: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
