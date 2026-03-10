import { LogOut, User, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../notification/NotificationBell';

export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <h1 className="text-lg font-semibold">作业管理系统</h1>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden sm:block">
              <p className="font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role === 'parent' ? '家长' : '孩子'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/settings')}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="设置"
          >
            <Settings className="h-5 w-5" />
          </button>

          <button
            onClick={handleLogout}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="退出登录"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
