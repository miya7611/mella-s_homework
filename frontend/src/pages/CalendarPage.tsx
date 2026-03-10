import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '../components/calendar/Calendar';
import { TaskCard } from '../components/task/TaskCard';
import { useTaskStore, useAuthStore } from '../stores';
import type { Task } from '../types/task';

export function CalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (user) {
      fetchTasks({ userId: user.id });
    }
  }, [user, fetchTasks]);

  const selectedDateTasks = tasks.filter(
    (task) => task.scheduled_date === selectedDate
  );

  const pendingTasks = selectedDateTasks.filter((t) => t.status !== 'completed');
  const completedTasks = selectedDateTasks.filter((t) => t.status === 'completed');

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-semibold mb-4">日历视图</h1>

      <Calendar
        tasks={tasks}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      {/* Selected date tasks */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          {isToday && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">今天</span>}
          {formatDate(selectedDate)}
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : selectedDateTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>这一天没有任务</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  待完成 ({pendingTasks.length})
                </h3>
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  已完成 ({completedTasks.length})
                </h3>
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
