import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useTaskReminders } from '../../hooks/useTaskReminders';

export function AppLayout() {
  // Initialize task reminders
  useTaskReminders();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
