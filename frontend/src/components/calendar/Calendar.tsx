import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Task } from '../../types/task';

interface CalendarProps {
  tasks: Task[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export function Calendar({ tasks, selectedDate, onDateSelect }: CalendarProps) {
  const selected = new Date(selectedDate);
  const currentMonth = selected.getMonth();
  const currentYear = selected.getFullYear();

  const goToPreviousMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    onDateSelect(formatDate(newDate));
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    onDateSelect(formatDate(newDate));
  };

  const goToToday = () => {
    onDateSelect(formatDate(new Date()));
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getTasksForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter((task) => task.scheduled_date === dateStr);
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const isSelected = (day: number) => {
    const selected = new Date(selectedDate);
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth &&
      selected.getFullYear() === currentYear
    );
  };

  const days = getDaysInMonth();

  return (
    <div className="bg-card rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-md hover:bg-accent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            {currentYear}年 {MONTHS[currentMonth]}
          </h2>
          <button
            onClick={goToToday}
            className="text-xs text-primary hover:underline mt-1"
          >
            回到今天
          </button>
        </div>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-md hover:bg-accent"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${
              index === 0 || index === 6 ? 'text-red-500' : 'text-muted-foreground'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-16" />;
          }

          const dayTasks = getTasksForDay(day);
          const completedTasks = dayTasks.filter((t) => t.status === 'completed').length;
          const pendingTasks = dayTasks.filter((t) => t.status !== 'completed').length;

          return (
            <button
              key={day}
              onClick={() => {
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                onDateSelect(dateStr);
              }}
              className={`h-16 p-1 rounded-md text-left transition-colors relative ${
                isSelected(day)
                  ? 'bg-primary text-primary-foreground'
                  : isToday(day)
                  ? 'bg-accent'
                  : 'hover:bg-accent'
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  (index % 7 === 0 || index % 7 === 6) && !isSelected(day) ? 'text-red-500' : ''
                }`}
              >
                {day}
              </span>
              {dayTasks.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {pendingTasks > 0 && (
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isSelected(day) ? 'bg-primary-foreground' : 'bg-orange-500'
                        }`}
                      />
                      <span className={`text-xs ${isSelected(day) ? '' : 'text-muted-foreground'}`}>
                        {pendingTasks}
                      </span>
                    </div>
                  )}
                  {completedTasks > 0 && (
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isSelected(day) ? 'bg-primary-foreground' : 'bg-green-500'
                        }`}
                      />
                      <span className={`text-xs ${isSelected(day) ? '' : 'text-muted-foreground'}`}>
                        {completedTasks}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span>待完成</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>已完成</span>
        </div>
      </div>
    </div>
  );
}
