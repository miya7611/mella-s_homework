import client from './client';
import type { ApiResponse } from '../types';
import type { Badge, BadgeStats } from '../types/badge';

export const badgesApi = {
  getBadges: async (): Promise<Badge[]> => {
    const response = await client.get<ApiResponse<Badge[]>>('/api/badges');
    return response.data.data;
  },

  getBadgeStats: async (): Promise<BadgeStats> => {
    const response = await client.get<ApiResponse<BadgeStats>>('/api/badges/stats');
    return response.data.data;
  },

  checkBadges: async (): Promise<Badge[]> => {
    const response = await client.post<ApiResponse<Badge[]>>('/api/badges/check');
    return response.data.data;
  },
};
