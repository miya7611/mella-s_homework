import client from './client';
import type { ApiResponse } from '../types';
import type { AuthResponse, LoginData, RegisterData, CreateChildData, User } from '../types/user';

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await client.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
    return response.data.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await client.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
    return response.data.data;
  },

  getCurrentUser: async (): Promise<{ userId: number; role: 'parent' | 'child' }> => {
    const response = await client.get<ApiResponse<{ userId: number; role: 'parent' | 'child' }>>('/api/me');
    return response.data.data;
  },

  createChild: async (data: CreateChildData): Promise<Partial<User>> => {
    const response = await client.post<ApiResponse<Partial<User>>>('/api/auth/children', data);
    return response.data.data;
  },

  getChildren: async (): Promise<Partial<User>[]> => {
    const response = await client.get<ApiResponse<Partial<User>[]>>('/api/auth/children');
    return response.data.data;
  },
};
