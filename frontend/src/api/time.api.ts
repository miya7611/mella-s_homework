import client from './client';
import type { ApiResponse } from '../types';
import type { TimeLog } from '../types/time';

export const timeApi = {
  getTimeLogsByTask: async (taskId: number): Promise<TimeLog[]> => {
    const response = await client.get<ApiResponse<TimeLog[]>>(`/api/time/task/${taskId}`);
    return response.data.data;
  },

  getMyTimeLogs: async (): Promise<TimeLog[]> => {
    const response = await client.get<ApiResponse<TimeLog[]>>('/api/time/my-logs');
    return response.data.data;
  },

  startTimeLog: async (taskId: number, notes?: string): Promise<TimeLog> => {
    const response = await client.post<ApiResponse<TimeLog>>('/api/time/start', {
      task_id: taskId,
      notes,
    });
    return response.data.data;
  },

  stopTimeLog: async (
    id: number,
    suggestedDuration?: number
  ): Promise<TimeLog> => {
    const response = await client.put<ApiResponse<TimeLog>>(`/api/time/${id}/stop`, {
      suggested_duration: suggestedDuration,
    });
    return response.data.data;
  },

  deleteTimeLog: async (id: number): Promise<void> => {
    await client.delete(`/api/time/${id}`);
  },
};
