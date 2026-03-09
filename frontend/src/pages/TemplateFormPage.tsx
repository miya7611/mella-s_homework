import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { templatesApi } from '../api/templates.api';
import type { CreateTemplateData } from '../types/template';
import { TASK_CATEGORIES } from '../lib/constants';

export function TemplateFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CreateTemplateData>({
    name: '',
    category: 'homework',
    description: '',
    suggested_duration: 30,
    points: 10
  });

  useEffect(() => {
    if (isEdit) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    setIsLoading(true);
    try {
      const template = await templatesApi.getTemplate(Number(id));
      setFormData({
        name: template.name,
        category: template.category,
        description: template.description || '',
        suggested_duration: template.suggested_duration || 30,
        points: template.points || 10
      });
    } catch (error) {
      console.error('Failed to fetch template:', error);
      alert('加载模板失败');
      navigate('/templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('请输入模板名称');
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit) {
        await templatesApi.updateTemplate(Number(id), formData);
      } else {
        await templatesApi.createTemplate(formData);
      }
      navigate('/templates');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{isEdit ? '编辑模板' : '创建模板'}</h2>
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{isEdit ? '编辑模板' : '创建模板'}</h2>
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">模板名称 *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如：数学作业、阅读打卡"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">分类</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="模板描述（可选）"
                rows={3}
                className="w-full px-3 py-2 border rounded-md bg-background resize-none"
              />
            </div>

            {/* Suggested Duration */}
            <div>
              <label className="block text-sm font-medium mb-1">建议时长（分钟）</label>
              <Input
                type="number"
                value={formData.suggested_duration}
                onChange={(e) => setFormData({ ...formData, suggested_duration: Number(e.target.value) })}
                min={1}
                placeholder="30"
              />
            </div>

            {/* Points */}
            <div>
              <label className="block text-sm font-medium mb-1">奖励积分</label>
              <Input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                min={0}
                placeholder="10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="mt-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/templates')}
          >
            取消
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </div>
  );
}
