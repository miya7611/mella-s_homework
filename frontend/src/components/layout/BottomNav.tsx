import { NavLink } from 'react-router-dom';
import { Home, ListTodo, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/tasks', icon: ListTodo, label: '任务' },
  { to: '/rewards', icon: Gift, label: '奖励' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => (
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
