import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.username.trim()) {
      errors.username = '请输入用户名';
    }
    if (!formData.password) {
      errors.password = '请输入密码';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    try {
      await login(formData);
      navigate('/');
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
        id="username"
        name="username"
        label="用户名"
        placeholder="请输入用户名"
        value={formData.username}
        onChange={handleChange}
        error={formErrors.username}
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="密码"
        placeholder="请输入密码"
        value={formData.password}
        onChange={handleChange}
        error={formErrors.password}
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        登录
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        还没有账号？{' '}
        <Link to="/register" className="text-primary hover:underline">
          立即注册
        </Link>
      </p>
    </form>
  );
}
