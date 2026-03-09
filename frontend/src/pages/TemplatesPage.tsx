import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Copy } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { templatesApi } from '../api/templates.api';
import type { TaskTemplate } from '../types/template';
import { TASK_CATEGORIES } from '../lib/constants';

export function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await templatesApi.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个模板吗？')) return;

    try {
      await templatesApi.deleteTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('删除失败');
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = TASK_CATEGORIES.find(c => c.value === category);
    return cat?.label || category;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">任务模板</h2>
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">任务模板</h2>
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Create Button */}
      <Button
        onClick={() => navigate('/templates/create')}
        className="w-full mb-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        创建模板
      </Button>

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>暂无模板</p>
          <p className="text-sm mt-2">点击上方按钮创建第一个模板</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="secondary">{getCategoryLabel(template.category)}</Badge>
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {template.suggested_duration && (
                        <span>时长: {formatDuration(template.suggested_duration)}</span>
                      )}
                      {template.points !== undefined && template.points > 0 && (
                        <span>积分: {template.points}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/tasks/create?template=${template.id}`)}
                      className="p-2 hover:bg-accent rounded"
                      title="使用模板创建任务"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/templates/${template.id}/edit`)}
                      className="p-2 hover:bg-accent rounded"
                      title="编辑"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 hover:bg-accent rounded text-red-500"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
