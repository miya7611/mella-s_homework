import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useChildrenStore, useAuthStore } from '../stores';
import { TaskForm } from '../components/task';
import { Card, CardContent } from '../components/ui/Card';
import { templatesApi } from '../api/templates.api';
import type { TaskTemplate } from '../types/template';

export function TaskCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const { user } = useAuthStore();
  const { children, fetchChildren, isLoading } = useChildrenStore();
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [template, setTemplate] = useState<TaskTemplate | null>(null);

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
          <TaskForm assignedTo={selectedChildId} template={template || undefined} />
        </div>
      )}
    </div>
  );
}
