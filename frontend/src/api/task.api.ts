import client from './client';
import type { ApiResponse } from '../types';
import type { Task, CreateTaskData, UpdateTaskData, TaskFilters } from '../types/task';

export const taskApi = {
  getTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', String(filters.userId));
    if (filters?.date) params.append('date', filters.date);
    if (filters?.createdBy) params.append('createdBy', String(filters.createdBy));

    const response = await client.get<ApiResponse<Task[]>>(`/api/tasks?${params.toString()}`);
    return response.data.data;
  },

  getTaskById: async (id: number): Promise<Task> => {
    const response = await client.get<ApiResponse<Task>>(`/api/tasks/${id}`);
    return response.data.data;
  },

  createTask: async (data: CreateTaskData): Promise<Task> => {
    const response = await client.post<ApiResponse<Task>>('/api/tasks', data);
    return response.data.data;
  },

  updateTask: async (id: number, data: UpdateTaskData): Promise<Task> => {
    const response = await client.put<ApiResponse<Task>>(`/api/tasks/${id}`, data);
    return response.data.data;
  },

  updateTaskStatus: async (id: number, status: string): Promise<Task> => {
    const response = await client.patch<ApiResponse<Task>>(`/api/tasks/${id}/status`, { status });
    return response.data.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await client.delete(`/api/tasks/${id}`);
  },
};
