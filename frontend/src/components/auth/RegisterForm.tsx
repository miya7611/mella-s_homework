import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { UserRole } from '../../types';

export function RegisterForm() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'child' as UserRole,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.username.trim()) {
      errors.username = '请输入用户名';
    } else if (formData.username.length < 2) {
      errors.username = '用户名至少2个字符';
    }

    const minPasswordLength = formData.role === 'parent' ? 6 : 4;
    if (!formData.password) {
      errors.password = '请输入密码';
    } else if (formData.password.length < minPasswordLength) {
      errors.password = `${formData.role === 'parent' ? '家长' : '孩子'}密码至少${minPasswordLength}个字符`;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次密码不一致';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    try {
      await register({
        username: formData.username,
        password: formData.password,
        role: formData.role,
      });
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

  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, role }));
    clearError();
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

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">选择角色</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleRoleChange('parent')}
            className={`flex-1 rounded-md border p-3 text-center transition-colors ${
              formData.role === 'parent'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-input hover:bg-accent'
            }`}
          >
            <span className="text-2xl">👨‍👩‍👧</span>
            <p className="mt-1 text-sm font-medium">家长</p>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('child')}
            className={`flex-1 rounded-md border p-3 text-center transition-colors ${
              formData.role === 'child'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-input hover:bg-accent'
            }`}
          >
            <span className="text-2xl">👦</span>
            <p className="mt-1 text-sm font-medium">孩子</p>
          </button>
        </div>
      </div>

      <Input
        id="password"
        name="password"
        type="password"
        label="密码"
        placeholder={formData.role === 'parent' ? '至少6个字符' : '至少4个字符'}
        value={formData.password}
        onChange={handleChange}
        error={formErrors.password}
      />

      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="确认密码"
        placeholder="请再次输入密码"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={formErrors.confirmPassword}
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        注册
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        已有账号？{' '}
        <Link to="/login" className="text-primary hover:underline">
          立即登录
        </Link>
      </p>
    </form>
  );
}
