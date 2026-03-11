import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../stores';
import type { CreateTaskData, RepeatType, RepeatConfig, Priority } from '../../types/task';
import type { TaskTemplate } from '../../types/template';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TASK_CATEGORIES } from '../../lib/constants';

interface TaskFormProps {
  assignedTo: number;
  template?: TaskTemplate;
}

const REPEAT_OPTIONS: { value: RepeatType; label: string }[] = [
  { value: 'none', label: '不重复' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: '低优先级', color: 'text-green-600' },
  { value: 'medium', label: '中优先级', color: 'text-yellow-600' },
  { value: 'high', label: '高优先级', color: 'text-red-600' },
];

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
    repeat_type: 'none' as RepeatType,
    repeat_end_date: '',
    priority: 'medium' as Priority,
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

    const repeatConfig: RepeatConfig | undefined = formData.repeat_type !== 'none' ? {
      endDate: formData.repeat_end_date || undefined,
    } : undefined;

    const data: CreateTaskData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      assigned_to: assignedTo,
      suggested_duration: formData.suggested_duration ? Number(formData.suggested_duration) : undefined,
      scheduled_date: formData.scheduled_date,
      scheduled_time: formData.scheduled_time || undefined,
      points: formData.points ? Number(formData.points) : 0,
      repeat_type: formData.repeat_type,
      repeat_config: repeatConfig,
      priority: formData.priority,
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

      {/* Priority Selection */}
      <div className="space-y-1.5">
        <label htmlFor="priority" className="text-sm font-medium text-foreground">
          优先级
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Repeat Options */}
      <div className="space-y-3 rounded-lg border p-4">
        <h3 className="text-sm font-medium">重复设置</h3>

        <div>
          <label htmlFor="repeat_type" className="mb-1 block text-sm text-muted-foreground">
            重复频率
          </label>
          <select
            id="repeat_type"
            name="repeat_type"
            value={formData.repeat_type}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {REPEAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {formData.repeat_type !== 'none' && (
          <Input
            id="repeat_end_date"
            name="repeat_end_date"
            type="date"
            label="结束日期（可选）"
            value={formData.repeat_end_date}
            onChange={handleChange}
            min={formData.scheduled_date}
          />
        )}
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
