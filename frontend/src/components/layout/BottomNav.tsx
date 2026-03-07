import { NavLink } from 'react-router-dom';
import { Home, ListTodo, PlusCircle } from 'lucide-react';
import { useAuthStore } from '../../stores';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/tasks', icon: ListTodo, label: '任务' },
];

const parentOnlyItems = [{ to: '/tasks/create', icon: PlusCircle, label: '创建' }];

export function BottomNav() {
  const { user } = useAuthStore();
  const isParent = user?.role === 'parent';

  const allItems = isParent ? [...navItems, ...parentOnlyItems] : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="flex h-16 items-center justify-around">
        {allItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 text-muted-foreground transition-colors',
                isActive && 'text-primary'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
