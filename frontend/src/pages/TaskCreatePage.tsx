import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useChildrenStore, useAuthStore } from '../stores';
import { TaskForm } from '../components/task';
import { Card, CardContent } from '../components/ui/Card';
import { templatesApi } from '../api/templates.api';
import type { TaskTemplate } from '../types/template';
import { OCRUploader } from '../components/ocr/OCRUploader';
import type { ParsedHomework } from '../services/ocrService';

import { ChevronDown, ChevronUp } from 'lucide-react';

export function TaskCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const { user } = useAuthStore();
  const { children, fetchChildren, isLoading } = useChildrenStore();
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [template, setTemplate] = useState<TaskTemplate | null>(null);
  const [ocrTitle, setOcrTitle] = useState<string>('');
  const [ocrDescription, setOcrDescription] = useState<string>('');
  const [showOCR, setShowOCR] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    // Load template if templateId is provided
    if (templateId) {
      templatesApi.getTemplate(Number(templateId))
        .then(setTemplate)
        .catch(console.error);
    }
  }, [templateId]);

  useEffect(() => {
    // Auto-select first child if available
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id as number);
    }
  }, [children, selectedChildId]);

  const handleOCRResult = (result: ParsedHomework) => {
    // Set the title from OCR result
    if (result.tasks.length > 0) {
      setOcrTitle(result.tasks[0]);
      // Use remaining tasks as description
      if (result.tasks.length > 1) {
        setOcrDescription(result.tasks.slice(1).join('\n'));
      }
    }
  };

  const handleOCRClear = () => {
    setOcrTitle('');
    setOcrDescription('');
  };

  if (!user) {
    return null;
  }

  // If no children, show a message to add children first
  if (!isLoading && children.length === 0) {
    return (
      <div className="p-4">
        <h2 className="mb-6 text-xl font-semibold">创建新任务</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              请先添加孩子账号，才能为其创建任务
            </p>
            <button
              onClick={() => navigate('/children')}
              className="text-primary hover:underline"
            >
              前往添加孩子
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-6 text-xl font-semibold">创建新任务</h2>

      {/* OCR Section - Collapsible */}
      <div className="mb-4">
        <button
          onClick={() => setShowOCR(!showOCR)}
          className="w-full flex items-center justify-between p-3 bg-muted rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">OCR 识别（可选）</span>
            <span className="text-xs text-muted-foreground">
              上传钉钉作业截图自动识别
            </span>
          </div>
          {showOCR ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showOCR && (
          <div className="mt-3">
            <OCRUploader onOCRResult={handleOCRResult} onClear={handleOCRClear} />
          </div>
        )}
      </div>

      {/* Child Selection */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">选择孩子</label>
        <div className="flex gap-2 flex-wrap">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id as number)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                selectedChildId === child.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {child.username}
            </button>
          ))}
        </div>
      </div>

      {/* Task Form */}
      {selectedChildId && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {template && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg text-sm">
              从模板创建: <span className="font-medium">{template.name}</span>
            </div>
          )}
          <TaskForm
            assignedTo={selectedChildId}
            template={template || undefined}
            initialTitle={ocrTitle || undefined}
            initialDescription={ocrDescription || undefined}
          />
        </div>
      )}
    </div>
  );
}
