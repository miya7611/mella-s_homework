export interface Attachment {
  id: number;
  task_id: number;
  file_name: string;
  file_type?: string;
  file_size?: number;
  content?: string; // Base64 encoded content
  uploaded_by: number;
  created_at: string;
}

export interface CreateAttachmentData {
  file_name: string;
  file_type?: string;
  file_size?: number;
  content?: string;
}
