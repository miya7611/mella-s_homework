import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../stores';
import type { CreateTaskData } from '../../types/task';
import type { TaskTemplate } from '../../types/template';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TASK_CATEGORIES } from '../../lib/constants';

interface TaskFormProps {
  assignedTo: number;
  template?: TaskTemplate;
}

export function TaskForm({ assignedTo, template }: TaskFormProps) {
  const navigate = useNavigate();
  const { createTask, isLoading, error, clearError } = useTaskStore();

  const [formData, setFormData] = useState({
    title: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'homework',
    suggested_duration: template?.suggested_duration?.toString() || '',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '',
    points: template?.points?.toString() || '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) {
      errors.title = '请输入任务标题';
    }
    if (!formData.scheduled_date) {
      errors.scheduled_date = '请选择日期';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    const data: CreateTaskData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      assigned_to: assignedTo,
      suggested_duration: formData.suggested_duration ? Number(formData.suggested_duration) : undefined,
      scheduled_date: formData.scheduled_date,
      scheduled_time: formData.scheduled_time || undefined,
      points: formData.points ? Number(formData.points) : 0,
    };

    try {
      await createTask(data);
      navigate('/tasks');
    } catch {
      // Error is handled by the store
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="title"
        name="title"
        label="任务标题"
        placeholder="请输入任务标题"
        value={formData.title}
        onChange={handleChange}
        error={formErrors.title}
      />

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          任务描述
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="请输入任务描述（可选）"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="category" className="text-sm font-medium text-foreground">
          任务分类
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {TASK_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="scheduled_date"
          name="scheduled_date"
          type="date"
          label="计划日期"
          value={formData.scheduled_date}
          onChange={handleChange}
          error={formErrors.scheduled_date}
        />

        <Input
          id="scheduled_time"
          name="scheduled_time"
          type="time"
          label="计划时间"
          value={formData.scheduled_time}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="suggested_duration"
          name="suggested_duration"
          type="number"
          label="预计时长（分钟）"
          placeholder="例如：30"
          value={formData.suggested_duration}
          onChange={handleChange}
          min={1}
        />

        <Input
          id="points"
          name="points"
          type="number"
          label="积分奖励"
          placeholder="例如：10"
          value={formData.points}
          onChange={handleChange}
          min={0}
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
          取消
        </Button>
        <Button type="submit" className="flex-1" isLoading={isLoading}>
          创建任务
        </Button>
      </div>
    </form>
  );
}
