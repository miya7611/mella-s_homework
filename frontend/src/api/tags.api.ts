import client from './client';
import type { ApiResponse } from '../types';
import type { Tag, CreateTagData, UpdateTagData } from '../types/tag';

export const tagsApi = {
  getTags: async (): Promise<Tag[]> => {
    const response = await client.get<ApiResponse<Tag[]>>('/api/tags');
    return response.data.data;
  },

  getTagsForTask: async (taskId: number): Promise<Tag[]> => {
    const response = await client.get<ApiResponse<Tag[]>>(`/api/tags/task/${taskId}`);
    return response.data.data;
  },

  createTag: async (data: CreateTagData): Promise<Tag> => {
    const response = await client.post<ApiResponse<Tag>>('/api/tags', data);
    return response.data.data;
  },

  updateTag: async (id: number, data: UpdateTagData): Promise<Tag> => {
    const response = await client.put<ApiResponse<Tag>>(`/api/tags/${id}`, data);
    return response.data.data;
  },

  deleteTag: async (id: number): Promise<void> => {
    await client.delete(`/api/tags/${id}`);
  },

  setTaskTags: async (taskId: number, tagIds: number[]): Promise<Tag[]> => {
    const response = await client.post<ApiResponse<Tag[]>>(`/api/tags/task/${taskId}`, { tagIds });
    return response.data.data;
  },
};
