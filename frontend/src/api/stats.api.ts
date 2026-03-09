import client from './client';
import type { ApiResponse } from '../types';
import type { UserStats } from '../types/stats';

export const statsApi = {
  getUserStats: async (days: number = 7): Promise<UserStats> => {
    const response = await client.get<ApiResponse<UserStats>>(`/api/stats?days=${days}`);
    return response.data.data;
  },
};
