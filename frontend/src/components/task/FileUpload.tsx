import { useState, useRef } from 'react';
import { Upload, Download, Trash2 } from 'lucide-react';
import { attachmentsApi, fileToBase64, formatFileSize, getFileIcon } from '../../api/attachments.api';
import type { Attachment } from '../../types/attachment';
import { Button } from '../ui/Button';

interface FileUploadProps {
  taskId: number;
  attachments: Omit<Attachment, 'content'>[];
  onAttachmentsChange: () => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function FileUpload({ taskId, attachments, onAttachmentsChange }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    const file = files[0];

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError('文件大小不能超过2MB');
      return;
    }

    setIsUploading(true);
    try {
      const content = await fileToBase64(file);
      await attachmentsApi.uploadAttachment(taskId, {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        content,
      });
      onAttachmentsChange();
    } catch (err) {
      setError('上传失败，请重试');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (attachment: Omit<Attachment, 'content'>) => {
    try {
      const fullAttachment = await attachmentsApi.getAttachment(taskId, attachment.id);
      if (fullAttachment.content) {
        // Create download link
        const byteCharacters = atob(fullAttachment.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fullAttachment.file_type || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fullAttachment.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (!confirm('确定要删除这个附件吗？')) return;

    try {
      await attachmentsApi.deleteAttachment(taskId, attachmentId);
      onAttachmentsChange();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">附件</label>

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? '上传中...' : '选择文件上传'}
        </Button>
        <p className="text-xs text-muted-foreground mt-1">最大文件大小：2MB</p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Attachment list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-2 border rounded-md bg-muted/30"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg">{getFileIcon(attachment.file_type)}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                  {attachment.file_size && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.file_size)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleDownload(attachment)}
                  className="p-1.5 hover:bg-accent rounded-md"
                  title="下载"
                >
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(attachment.id)}
                  className="p-1.5 hover:bg-destructive/10 rounded-md"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
