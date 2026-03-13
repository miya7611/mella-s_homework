import { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import type { Task, TaskStatus } from '../../types/task';
import { cn } from '../../lib/utils';

interface SubtaskListProps {
  subtasks: Task[];
  progress: { total: number; completed: number; percentage: number };
  onAddSubtask: (title: string) => Promise<void>;
  onDeleteSubtask: (subtaskId: number) => Promise<void>;
  onToggleSubtask: (subtaskId: number, status: TaskStatus) => Promise<void>;
  onSubtaskClick?: (subtask: Task) => void;
  canEdit: boolean;
}

export function SubtaskList({
  subtasks,
  progress,
  onAddSubtask,
  onDeleteSubtask,
  onToggleSubtask,
  onSubtaskClick,
  canEdit,
}: SubtaskListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    setIsAdding(true);
    try {
      await onAddSubtask(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add subtask:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    if (!confirm('确定要删除这个子任务吗？')) return;

    setDeletingId(subtaskId);
    try {
      await onDeleteSubtask(subtaskId);
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleComplete = async (subtask: Task) => {
    const newStatus: TaskStatus = subtask.status === 'completed' ? 'pending' : 'completed';
    await onToggleSubtask(subtask.id, newStatus);
  };

  return (
    <div className="space-y-3">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">子任务</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{progress.completed}/{progress.total}</span>
          {progress.total > 0 && (
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Subtask list */}
      {subtasks.length > 0 && (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <Card
              key={subtask.id}
              className={cn(
                'transition-colors',
                subtask.status === 'completed' && 'opacity-60'
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {/* Toggle button */}
                  <button
                    onClick={() => handleToggleComplete(subtask)}
                    className="flex-shrink-0 text-primary hover:text-primary/80"
                  >
                    {subtask.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  {/* Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSubtaskClick?.(subtask)}
                  >
                    <p className={cn(
                      'text-sm font-medium',
                      subtask.status === 'completed' && 'line-through text-muted-foreground'
                    )}>
                      {subtask.title}
                    </p>
                    {subtask.points > 0 && (
                      <p className="text-xs text-muted-foreground">{subtask.points} 积分</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {onSubtaskClick && (
                      <button
                        onClick={() => onSubtaskClick(subtask)}
                        className="p-1 hover:bg-accent rounded"
                      >
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        disabled={deletingId === subtask.id}
                        className="p-1 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add subtask form */}
      {showAddForm ? (
        <form onSubmit={handleAddSubtask} className="flex gap-2">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="输入子任务标题..."
            className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
            autoFocus
            disabled={isAdding}
          />
          <Button type="submit" size="sm" disabled={!newSubtaskTitle.trim() || isAdding}>
            添加
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowAddForm(false);
              setNewSubtaskTitle('');
            }}
          >
            取消
          </Button>
        </form>
      ) : canEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          添加子任务
        </Button>
      )}

      {/* Empty state */}
      {subtasks.length === 0 && !canEdit && (
        <p className="text-center text-sm text-muted-foreground py-2">暂无子任务</p>
      )}
    </div>
  );
}
