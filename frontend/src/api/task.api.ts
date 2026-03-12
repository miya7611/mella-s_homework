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

  getPendingReviewTasks: async (): Promise<Task[]> => {
    const response = await client.get<ApiResponse<Task[]>>('/api/tasks/pending-review');
    return response.data.data;
  },

  reviewTask: async (id: number, approved: boolean, comment?: string): Promise<Task> => {
    const response = await client.post<ApiResponse<Task>>(`/api/tasks/${id}/review`, {
      approved,
      comment,
    });
    return response.data.data;
  },

  getUpcomingTasks: async (days?: number): Promise<Task[]> => {
    const params = days ? `?days=${days}` : '';
    const response = await client.get<ApiResponse<Task[]>>(`/api/tasks/upcoming${params}`);
    return response.data.data;
  },

  getOverdueTasks: async (): Promise<Task[]> => {
    const response = await client.get<ApiResponse<Task[]>>('/api/tasks/overdue');
    return response.data.data;
  },

  getDueTodayTasks: async (): Promise<Task[]> => {
    const response = await client.get<ApiResponse<Task[]>>('/api/tasks/due-today');
    return response.data.data;
  },

  searchTasks: async (params: {
    q?: string;
    status?: string[];
    priority?: string[];
    category?: string[];
    dateFrom?: string;
    dateTo?: string;
    userId?: number;
    createdBy?: number;
  }): Promise<{ tasks: Task[]; count: number }> => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.status?.length) searchParams.append('status', params.status.join(','));
    if (params.priority?.length) searchParams.append('priority', params.priority.join(','));
    if (params.category?.length) searchParams.append('category', params.category.join(','));
    if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.append('dateTo', params.dateTo);
    if (params.userId) searchParams.append('userId', String(params.userId));
    if (params.createdBy) searchParams.append('createdBy', String(params.createdBy));

    const response = await client.get<ApiResponse<Task[]> & { count: number }>(
      `/api/tasks/search?${searchParams.toString()}`
    );
    return { tasks: response.data.data, count: response.data.count };
  },
};
