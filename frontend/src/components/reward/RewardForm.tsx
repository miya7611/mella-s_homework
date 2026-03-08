import { useState } from 'react';
import { useRewardStore } from '../../stores';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface RewardFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RewardForm({ onSuccess, onCancel }: RewardFormProps) {
  const { createReward, isLoading, error, clearError } = useRewardStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    required_points: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = '请输入奖励名称';
    }
    if (!formData.required_points || Number(formData.required_points) <= 0) {
      errors.required_points = '请输入有效积分';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    try {
      await createReward({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        required_points: Number(formData.required_points),
      });
      setFormData({ name: '', description: '', required_points: '' });
      onSuccess?.();
    } catch {
      // Error handled by store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="reward-name"
        name="name"
        label="奖励名称"
        placeholder="例如：冰淇淋"
        value={formData.name}
        onChange={handleChange}
        error={formErrors.name}
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium">描述</label>
        <textarea
          id="description"
          name="description"
          placeholder="奖励描述（可选）"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <Input
        id="required_points"
        name="required_points"
        type="number"
        label="所需积分"
        placeholder="100"
        value={formData.required_points}
        onChange={handleChange}
        error={formErrors.required_points}
        min={1}
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            取消
          </Button>
        )}
        <Button type="submit" className="flex-1" isLoading={isLoading}>
          创建奖励
        </Button>
      </div>
    </form>
  );
}
