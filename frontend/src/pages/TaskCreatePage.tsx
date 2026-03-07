import { useAuthStore } from '../stores';
import { TaskForm } from '../components/task';

export function TaskCreatePage() {
  const { user } = useAuthStore();

  // For now, parent creates tasks for themselves (or could select a child)
  // In a full implementation, there would be a child selection UI
  if (!user) {
    return null;
  }

  return (
    <div className="p-4">
      <h2 className="mb-6 text-xl font-semibold">创建新任务</h2>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <TaskForm assignedTo={user.id} />
      </div>
    </div>
  );
}
