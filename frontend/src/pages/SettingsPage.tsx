import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { User, Lock, LogOut, ChevronRight, LayoutTemplate, Download, FileJson, FileSpreadsheet, Bell } from 'lucide-react';
import { exportApi } from '../api/export.api';

const AVATARS = ['🐶', '🐱', '🐼', '🦊', '🦁', '🐸', '🐵', '🐰', '🐻', '🐨'];

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword, isLoading, error, clearError } =
    useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleAvatarSelect = async (avatar: string) => {
    setSelectedAvatar(avatar);
    clearError();
    setSuccessMessage(null);

    try {
      await updateProfile({ avatar });
      setSuccessMessage('头像更新成功');
    } catch {
      // Error handled by store
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError(null);
    setSuccessMessage(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('请填写所有密码字段');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    const minLength = user?.role === 'parent' ? 6 : 4;
    if (passwordForm.newPassword.length < minLength) {
      setPasswordError(`新密码至少需要 ${minLength} 个字符`);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccessMessage('密码修改成功');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      // Error handled by store
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      await exportApi.exportJSON();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTasksCSV = async () => {
    setIsExporting(true);
    try {
      await exportApi.exportTasksCSV();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTimeLogsCSV = async () => {
    setIsExporting(true);
    try {
      await exportApi.exportTimeLogsCSV();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 pb-20">
      <h2 className="text-xl font-semibold mb-4">设置</h2>

      {/* User Info Card */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
              {user.avatar || '👤'}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user.username}</h3>
              <p className="text-sm text-muted-foreground">
                {user.role === 'parent' ? '家长' : '孩子'} · Lv.{user.level}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === 'profile' ? 'default' : 'outline'}
          onClick={() => setActiveTab('profile')}
          className="flex-1"
        >
          <User className="h-4 w-4 mr-2" />
          个人资料
        </Button>
        <Button
          variant={activeTab === 'password' ? 'default' : 'outline'}
          onClick={() => setActiveTab('password')}
          className="flex-1"
        >
          <Lock className="h-4 w-4 mr-2" />
          修改密码
        </Button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 rounded-md bg-green-100 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {activeTab === 'profile' && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">选择头像</h4>
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => handleAvatarSelect(avatar)}
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all ${
                    selectedAvatar === avatar
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">总积分</span>
                <span className="font-medium">{user.total_points}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">注册时间</span>
                <span className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'password' && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                label="当前密码"
                placeholder="输入当前密码"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
              />

              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                label="新密码"
                placeholder={user.role === 'parent' ? '至少6个字符' : '至少4个字符'}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="确认新密码"
                placeholder="再次输入新密码"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                error={passwordError || undefined}
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                修改密码
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Theme Settings */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">主题设置</h4>
          <p className="text-sm text-muted-foreground mb-3">选择您喜欢的界面主题</p>
          <ThemeToggle className="w-full justify-center" />
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="mt-4">
        <CardContent className="p-0">
          <button
            onClick={() => navigate('/notifications/settings')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <div className="text-left">
                <span>通知设置</span>
                <p className="text-xs text-muted-foreground">配置浏览器通知提醒</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      {/* Parent Tools */}
      {user.role === 'parent' && (
        <Card className="mt-4">
          <CardContent className="p-0">
            <div className="p-3 border-b">
              <h4 className="text-sm font-medium text-muted-foreground">家长工具</h4>
            </div>
            <button
              onClick={() => navigate('/templates')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg"
            >
              <div className="flex items-center gap-3">
                <LayoutTemplate className="h-5 w-5" />
                <span>任务模板</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      )}

      {/* Data Export */}
      <Card className="mt-4">
        <CardContent className="p-0">
          <div className="p-3 border-b">
            <h4 className="text-sm font-medium text-muted-foreground">数据导出</h4>
          </div>
          <div className="p-4 space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExportJSON}
              disabled={isExporting}
            >
              <FileJson className="h-5 w-5 mr-3" />
              导出全部数据 (JSON)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExportTasksCSV}
              disabled={isExporting}
            >
              <FileSpreadsheet className="h-5 w-5 mr-3" />
              导出任务列表 (CSV)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExportTimeLogsCSV}
              disabled={isExporting}
            >
              <Download className="h-5 w-5 mr-3" />
              导出时间记录 (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Card className="mt-4">
        <CardContent className="p-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 text-destructive hover:bg-muted/50 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5" />
              <span>退出登录</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
