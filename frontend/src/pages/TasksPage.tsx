import { useEffect, useState, useMemo } from 'react';
import { useTaskStore, useAuthStore } from '../stores';
import { TaskList } from '../components/task';
import type { TaskStatus, Task } from '../types/task';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

type FilterTab = 'all' | 'pending' | 'in_progress' | 'completed';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待完成' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
];

export function TasksPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks, isLoading, fetchTasks, updateTaskStatus } = useTaskStore();

  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    if (user) {
      fetchTasks({ userId: user.id, date: dateFilter });
    }
  }, [user, dateFilter, fetchTasks]);

  const handleStatusChange = async (taskId: number, status: TaskStatus) => {
    await updateTaskStatus(taskId, status);
  };

  const handleTaskClick = (task: Task) => {
    navigate(`/tasks/${task.id}`);
  };

  const isParent = user?.role === 'parent';

  // Filter tasks by status tab
  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') {
      return tasks;
    }
    if (activeTab === 'pending') {
      return tasks.filter((t) => t.status === 'pending' || t.status === 'planned');
    }
    return tasks.filter((t) => t.status === activeTab);
  }, [tasks, activeTab]);

  // Count tasks by status
  const taskCounts = useMemo(() => {
    const counts = {
      all: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending' || t.status === 'planned').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
    return counts;
  }, [tasks]);

  return (
    <div className="p-4 pb-20">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">我的任务</h2>
        {isParent && (
          <Button onClick={() => navigate('/tasks/create')} size="sm">
            创建任务
          </Button>
        )}
      </div>

      {/* Date Filter */}
      <div className="mb-4">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 text-xs ${
                activeTab === tab.value
                  ? 'text-primary-foreground/70'
                  : 'text-muted-foreground/70'
              }`}
            >
              ({taskCounts[tab.value]})
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>
            {activeTab === 'all'
              ? '今天没有任务'
              : activeTab === 'pending'
                ? '没有待完成的任务'
                : activeTab === 'in_progress'
                  ? '没有进行中的任务'
                  : '没有已完成的任务'}
          </p>
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          isLoading={isLoading}
          onTaskClick={handleTaskClick}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
