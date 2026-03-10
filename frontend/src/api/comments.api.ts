import client from './client';
import type { ApiResponse } from '../types';
import type { TaskComment, CreateCommentData } from '../types/comment';

export const commentsApi = {
  getComments: async (taskId: number): Promise<TaskComment[]> => {
    const response = await client.get<ApiResponse<TaskComment[]>>(
      `/api/tasks/${taskId}/comments`
    );
    return response.data.data;
  },

  createComment: async (taskId: number, data: CreateCommentData): Promise<TaskComment> => {
    const response = await client.post<ApiResponse<TaskComment>>(
      `/api/tasks/${taskId}/comments`,
      data
    );
    return response.data.data;
  },

  deleteComment: async (taskId: number, commentId: number): Promise<void> => {
    await client.delete(`/api/tasks/${taskId}/comments/${commentId}`);
  },
};
