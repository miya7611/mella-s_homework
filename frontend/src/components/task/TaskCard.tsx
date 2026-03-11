import { Clock, Calendar, Trophy, Flag } from 'lucide-react';
import type { Task, TaskStatus, Priority } from '../../types/task';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TASK_STATUS, TASK_CATEGORIES } from '../../lib/constants';
import { cn } from '../../lib/utils';

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string }> = {
  low: { label: '低', color: 'text-green-600', bgColor: 'bg-green-100' },
  medium: { label: '中', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  high: { label: '高', color: 'text-red-600', bgColor: 'bg-red-100' },
};

interface TaskCardProps {
  task: Task;
  onStatusChange?: (status: TaskStatus) => void;
  onClick?: () => void;
}

export function TaskCard({ task, onStatusChange, onClick }: TaskCardProps) {
  const statusInfo = TASK_STATUS[task.status];
  const categoryInfo = TASK_CATEGORIES.find((c) => c.value === task.category);
  const priorityInfo = PRIORITY_CONFIG[task.priority || 'medium'];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return null;
    return time;
  };

  return (
    <Card
      className={cn('transition-shadow hover:shadow-md', onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{categoryInfo?.icon || '📋'}</span>
              <h3 className="font-medium text-foreground truncate">{task.title}</h3>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.scheduled_date)}</span>
                {task.scheduled_time && (
                  <span>{formatTime(task.scheduled_time)}</span>
                )}
              </div>

              {task.suggested_duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{task.suggested_duration}分钟</span>
                </div>
              )}

              {task.points > 0 && (
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  <span>{task.points}分</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded text-xs', priorityInfo.bgColor, priorityInfo.color)}>
              <Flag className="h-3 w-3" />
              {priorityInfo.label}
            </span>
            <Badge variant={statusInfo.color as any}>{statusInfo.label}</Badge>
          </div>
        </div>

        {onStatusChange && task.status !== 'completed' && (
          <div className="mt-3 pt-3 border-t">
            <select
              value={task.status}
              onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              {Object.entries(TASK_STATUS).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
