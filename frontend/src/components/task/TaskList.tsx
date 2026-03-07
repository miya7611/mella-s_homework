import type { Task, TaskStatus } from '../../types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onTaskClick?: (task: Task) => void;
  onStatusChange?: (taskId: number, status: TaskStatus) => void;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  isLoading,
  onTaskClick,
  onStatusChange,
  emptyMessage = '暂无任务',
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={() => onTaskClick?.(task)}
          onStatusChange={
            onStatusChange
              ? (status) => onStatusChange(task.id, status)
              : undefined
          }
        />
      ))}
    </div>
  );
}
