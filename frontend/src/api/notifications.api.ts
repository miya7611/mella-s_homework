import client from './client';
import type { ApiResponse } from '../types';
import type { Notification } from '../types/notification';

export const notificationsApi = {
  getNotifications: async (limit: number = 20, offset: number = 0): Promise<Notification[]> => {
    const response = await client.get<ApiResponse<Notification[]>>(
      `/api/notifications?limit=${limit}&offset=${offset}`
    );
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await client.get<ApiResponse<{ count: number }>>(
      '/api/notifications/unread-count'
    );
    return response.data.data.count;
  },

  markAsRead: async (id: number): Promise<void> => {
    await client.put(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await client.put('/api/notifications/read-all');
  },

  deleteNotification: async (id: number): Promise<void> => {
    await client.delete(`/api/notifications/${id}`);
  },
};
