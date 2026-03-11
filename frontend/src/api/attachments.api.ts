import client from './client';
import type { ApiResponse } from '../types';
import type { Attachment, CreateAttachmentData } from '../types/attachment';

export const attachmentsApi = {
  getAttachments: async (taskId: number): Promise<Omit<Attachment, 'content'>[]> => {
    const response = await client.get<ApiResponse<Omit<Attachment, 'content'>[]>>(
      `/api/tasks/${taskId}/attachments`
    );
    return response.data.data;
  },

  getAttachment: async (taskId: number, attachmentId: number): Promise<Attachment> => {
    const response = await client.get<ApiResponse<Attachment>>(
      `/api/tasks/${taskId}/attachments/${attachmentId}`
    );
    return response.data.data;
  },

  uploadAttachment: async (taskId: number, data: CreateAttachmentData): Promise<Omit<Attachment, 'content'>> => {
    const response = await client.post<ApiResponse<Omit<Attachment, 'content'>>>(
      `/api/tasks/${taskId}/attachments`,
      data
    );
    return response.data.data;
  },

  deleteAttachment: async (taskId: number, attachmentId: number): Promise<void> => {
    await client.delete(`/api/tasks/${taskId}/attachments/${attachmentId}`);
  },
};

// Helper function to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to format file size
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Helper to get file icon based on type
export const getFileIcon = (fileType?: string): string => {
  if (!fileType) return '📄';
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎬';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType.includes('pdf')) return '📕';
  if (fileType.includes('word') || fileType.includes('document')) return '📘';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📗';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return '📦';
  return '📄';
};
