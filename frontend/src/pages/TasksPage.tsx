import { useEffect, useState } from 'react';
import { useTaskStore, useAuthStore } from '../stores';
import { TaskList } from '../components/task';
import type { TaskStatus, Task } from '../types/task';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function TasksPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks, isLoading, fetchTasks, updateTaskStatus } = useTaskStore();

  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user) {
      fetchTasks({ userId: user.id, date: dateFilter });
    }
  }, [user, dateFilter, fetchTasks]);

  const handleStatusChange = async (taskId: number, status: TaskStatus) => {
    await updateTaskStatus(taskId, status);
  };

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
  };

  const isParent = user?.role === 'parent';

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">我的任务</h2>
        {isParent && (
          <Button onClick={() => navigate('/tasks/create')} size="sm">
            创建任务
          </Button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        onTaskClick={handleTaskClick}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
