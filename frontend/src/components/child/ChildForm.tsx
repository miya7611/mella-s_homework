import { useState } from 'react';
import { useChildrenStore } from '../../stores';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ChildFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ChildForm({ onSuccess, onCancel }: ChildFormProps) {
  const { createChild, isLoading, error, clearError } = useChildrenStore();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.username.trim()) {
      errors.username = '请输入用户名';
    } else if (formData.username.length < 2) {
      errors.username = '用户名至少2个字符';
    }
    if (!formData.password) {
      errors.password = '请输入密码';
    } else if (formData.password.length < 4) {
      errors.password = '密码至少4个字符';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    try {
      await createChild({
        username: formData.username.trim(),
        password: formData.password,
      });
      setFormData({ username: '', password: '' });
      onSuccess?.();
    } catch {
      // Error is handled by the store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="child-username"
        name="username"
        label="孩子用户名"
        placeholder="请输入用户名"
        value={formData.username}
        onChange={handleChange}
        error={formErrors.username}
      />

      <Input
        id="child-password"
        name="password"
        type="password"
        label="密码"
        placeholder="至少4个字符"
        value={formData.password}
        onChange={handleChange}
        error={formErrors.password}
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
          创建账号
        </Button>
      </div>
    </form>
  );
}
