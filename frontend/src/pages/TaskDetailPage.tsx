import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Trophy, Trash2, Timer as TimerIcon } from 'lucide-react';
import { useTaskStore, useAuthStore, useTimeStore } from '../stores';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Timer, TimeLogList } from '../components/time';
import { TASK_STATUS, TASK_CATEGORIES } from '../lib/constants';
import type { TaskStatus } from '../types/task';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTask, isLoading, error, fetchTaskById, updateTaskStatus, deleteTask, clearCurrentTask } = useTaskStore();
  const {
    timeLogs,
    currentTimer,
    fetchTimeLogsByTask,
    startTimeLog,
    stopTimeLog,
    deleteTimeLog,
  } = useTimeStore();

  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTaskById(Number(id));
      fetchTimeLogsByTask(Number(id));
    }
    return () => {
      clearCurrentTask();
    };
  }, [id, fetchTaskById, fetchTimeLogsByTask, clearCurrentTask]);

  const isParent = user?.role === 'parent';
  const isAssignedToMe = currentTask?.assigned_to === user?.id;
  const canEdit = isParent && currentTask?.created_by === user?.id;
  const canUpdateStatus = isAssignedToMe;

  // Find active timer for this task
  const activeTimer = currentTimer && currentTimer.task_id === Number(id) ? currentTimer : null;
  const isTimerRunning = activeTimer && !activeTimer.end_time;
  const taskTimeLogs = timeLogs.filter((log) => log.task_id === Number(id));

  const handleStatusChange = async (status: TaskStatus) => {
    if (!currentTask) return;
    setIsUpdating(true);
    try {
      await updateTaskStatus(currentTask.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!currentTask) return;
    try {
      await deleteTask(currentTask.id);
      navigate('/tasks');
    } catch {
      // Error handled by store
    }
  };

  const handleStartTimer = async () => {
    if (!currentTask) return;
    try {
      await startTimeLog(currentTask.id);
      // If task is not in_progress, update status
      if (currentTask.status !== 'in_progress') {
        await updateTaskStatus(currentTask.id, 'in_progress');
      }
    } catch {
      // Error handled by store
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    try {
      await stopTimeLog(activeTimer.id, currentTask?.suggested_duration);
    } catch {
      // Error handled by store
    }
  };

  const handleDeleteTimeLog = async (logId: number) => {
    try {
      await deleteTimeLog(logId);
    } catch {
      // Error handled by store
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return null;
    return time;
  };

  const calculateTotalDuration = () => {
    return taskTimeLogs
      .filter((log) => log.end_time)
      .reduce((sum, log) => sum + log.duration, 0);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="h-8 w-24 bg-muted rounded animate-pulse mb-4" />
        <div className="space-y-4">
          <div className="h-40 bg-muted rounded animate-pulse" />
          <div className="h-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={() => navigate('/tasks')} className="mt-4">
              返回任务列表
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">任务不存在</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = TASK_STATUS[currentTask.status];
  const categoryInfo = TASK_CATEGORIES.find((c) => c.value === currentTask.category);
  const totalDuration = calculateTotalDuration();

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-semibold flex-1">任务详情</h1>
        {canEdit && !showDeleteConfirm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Card className="mb-4 border-destructive">
          <CardContent className="p-4">
            <p className="text-sm mb-3">确定要删除这个任务吗？此操作不可撤销。</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                取消
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                删除
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Info */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{categoryInfo?.icon || '📋'}</span>
              <Badge variant={statusInfo.color as any}>{statusInfo.label}</Badge>
            </div>
            {currentTask.points > 0 && (
              <div className="flex items-center gap-1 text-yellow-500">
                <Trophy className="h-5 w-5" />
                <span className="font-semibold">{currentTask.points} 分</span>
              </div>
            )}
          </div>

          <h2 className="text-lg font-semibold mb-2">{currentTask.title}</h2>

          {currentTask.description && (
            <p className="text-muted-foreground mb-4">{currentTask.description}</p>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(currentTask.scheduled_date)}</span>
              {currentTask.scheduled_time && (
                <span>{formatTime(currentTask.scheduled_time)}</span>
              )}
            </div>

            {currentTask.suggested_duration && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>预计时长: {currentTask.suggested_duration} 分钟</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timer (for assigned user) */}
      {canUpdateStatus && currentTask.status !== 'completed' && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <TimerIcon className="h-4 w-4" />
            计时器
          </h3>
          <Timer
            isRunning={isTimerRunning || false}
            startTime={activeTimer?.start_time || null}
            suggestedDuration={currentTask.suggested_duration}
            onStart={handleStartTimer}
            onStop={handleStopTimer}
          />
        </div>
      )}

      {/* Time Logs */}
      {taskTimeLogs.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>时间记录</span>
              {totalDuration > 0 && (
                <span className="text-sm text-muted-foreground font-normal">
                  总计: {totalDuration} 分钟
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeLogList
              timeLogs={taskTimeLogs}
              onDelete={isParent ? handleDeleteTimeLog : undefined}
              showDelete={isParent}
            />
          </CardContent>
        </Card>
      )}

      {/* Status Update (for assigned user) */}
      {canUpdateStatus && currentTask.status !== 'completed' && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">更新状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TASK_STATUS)
                .filter(([key]) => key !== currentTask.status)
                .map(([value, { label, color }]) => (
                  <Button
                    key={value}
                    variant="outline"
                    onClick={() => handleStatusChange(value as TaskStatus)}
                    disabled={isUpdating}
                    className="justify-start"
                  >
                    <Badge variant={color as any} className="mr-2">{label}</Badge>
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Meta Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">任务信息</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>分类: {categoryInfo?.label || currentTask.category}</p>
          <p>创建时间: {new Date(currentTask.created_at).toLocaleString('zh-CN')}</p>
          {currentTask.actual_start_time && (
            <p>开始时间: {new Date(currentTask.actual_start_time).toLocaleString('zh-CN')}</p>
          )}
          {currentTask.actual_end_time && (
            <p>完成时间: {new Date(currentTask.actual_end_time).toLocaleString('zh-CN')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
