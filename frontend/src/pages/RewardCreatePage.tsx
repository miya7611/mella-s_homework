import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRewardStore } from '../stores';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

export function RewardCreatePage() {
  const navigate = useNavigate();
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
      errors.required_points = '请输入有效的所需积分';
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
      navigate('/rewards');
    } catch {
      // Error handled by store
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">创建奖励</h2>
        <Button variant="outline" onClick={() => navigate('/rewards')} size="sm">
          取消
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <Input
            id="name"
            name="name"
            label="奖励名称"
            placeholder="例如：看电影、吃冰淇淋"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
          />

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              描述
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="描述这个奖励"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <Input
            id="required_points"
            name="required_points"
            type="number"
            label="所需积分"
            placeholder="例如：100"
            value={formData.required_points}
            onChange={handleChange}
            error={formErrors.required_points}
            min={1}
          />

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/rewards')} className="flex-1">
              取消
            </Button>
            <Button type="submit" onClick={handleSubmit} className="flex-1" isLoading={isLoading}>
              创建奖励
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
