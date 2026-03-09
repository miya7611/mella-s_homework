import client from './client';
import type { ApiResponse } from '../types';
import type { TaskTemplate, CreateTemplateData, UpdateTemplateData } from '../types/template';

export const templatesApi = {
  getTemplates: async (): Promise<TaskTemplate[]> => {
    const response = await client.get<ApiResponse<TaskTemplate[]>>('/api/templates');
    return response.data.data;
  },

  getTemplate: async (id: number): Promise<TaskTemplate> => {
    const response = await client.get<ApiResponse<TaskTemplate>>(`/api/templates/${id}`);
    return response.data.data;
  },

  createTemplate: async (data: CreateTemplateData): Promise<TaskTemplate> => {
    const response = await client.post<ApiResponse<TaskTemplate>>('/api/templates', data);
    return response.data.data;
  },

  updateTemplate: async (id: number, data: UpdateTemplateData): Promise<TaskTemplate> => {
    const response = await client.put<ApiResponse<TaskTemplate>>(`/api/templates/${id}`, data);
    return response.data.data;
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await client.delete(`/api/templates/${id}`);
  },
};
