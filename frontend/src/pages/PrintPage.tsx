import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Printer, Download, Calendar } from 'lucide-react';
import { useAuthStore } from '../stores';
import { pdfExportService } from '../services/pdfExportService';
import { taskApi } from '../api/task.api';
import type { Task } from '../types/task';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function PrintPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const fetchedTasks = await taskApi.getTasks({ userId: user.id });
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const getWeekRange = () => {
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    return { start: startOfWeek, end: endOfWeek };
  };

  const getTasksForWeek = () => {
    const { start, end } = getWeekRange();
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduled_date);
      return taskDate >= start && taskDate <= end;
    });
  };

  const handleExportPDF = async () => {
    if (!user) return;
    try {
      await pdfExportService.generateWeeklyReport(user.id, user.username);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('生成PDF失败，请重试');
    }
  };

  const handlePrintChecklist = () => {
    const weekTasks = getTasksForWeek();
    const { start, end } = getWeekRange();
    const title = `任务清单 (${start.toLocaleDateString('zh-CN')} - ${end.toLocaleDateString('zh-CN')})`;
    pdfExportService.generatePrintableChecklist(weekTasks, title);
  };

  const weekTasks = getTasksForWeek();
  const { start, end } = getWeekRange();

  // Group tasks by date
  const tasksByDate: Record<string, Task[]> = {};
  weekTasks.forEach(task => {
    if (!tasksByDate[task.scheduled_date]) {
      tasksByDate[task.scheduled_date] = [];
    }
    tasksByDate[task.scheduled_date].push(task);
  });

  const completedTasks = weekTasks.filter(t => t.status === 'completed').length;
  const completionRate = weekTasks.length > 0
    ? Math.round((completedTasks / weekTasks.length) * 100)
    : 0;
  const totalPoints = weekTasks.reduce((sum, t) => sum + (t.points || 0), 0);
  const earnedPoints = weekTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.points || 0), 0);

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">打印与导出</h2>
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Export Options */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <FileText className="h-5 w-5" />
            导出选项
          </h3>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleExportPDF}
            disabled={isLoading || weekTasks.length === 0}
          >
            <Download className="h-5 w-5 mr-3" />
            导出周报告 (PDF)
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handlePrintChecklist}
            disabled={isLoading || weekTasks.length === 0}
          >
            <Printer className="h-5 w-5 mr-3" />
            打印任务清单
          </Button>
        </CardContent>
      </Card>

      {/* Week Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">选择周</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 7);
                  setSelectedDate(newDate);
                }}
                className="px-3 py-1 rounded bg-muted hover:bg-accent"
              >
                上一周
              </button>
              <span className="text-sm">
                {start.toLocaleDateString('zh-CN')} - {end.toLocaleDateString('zh-CN')}
              </span>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 7);
                  setSelectedDate(newDate);
                }}
                className="px-3 py-1 rounded bg-muted hover:bg-accent"
              >
                下一周
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">预览</h3>

          {/* Summary */}
          <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold">{weekTasks.length}</p>
              <p className="text-xs text-muted-foreground">总任务</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">已完成</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">完成率</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{earnedPoints}/{totalPoints}</p>
              <p className="text-xs text-muted-foreground">积分</p>
            </div>
          </div>

          {/* Task List Preview */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : weekTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">该周没有任务</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(tasksByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, dateTasks]) => {
                  const d = new Date(date);
                  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                  return (
                    <div key={date}>
                      <div className="bg-accent px-3 py-2 rounded-t-lg font-medium text-sm">
                        {d.toLocaleDateString('zh-CN')} {weekdays[d.getDay()]}
                      </div>
                      <div className="border border-t-0 rounded-b-lg divide-y">
                        {dateTasks.map(task => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 px-3 py-2"
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              task.status === 'completed'
                                ? 'bg-green-500 border-green-500'
                                : 'border-muted-foreground'
                            }`}>
                              {task.status === 'completed' && (
                                <span className="text-white text-xs">✓</span>
                              )}
                            </div>
                            <span className={`flex-1 text-sm ${
                              task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                            }`}>
                              {task.title}
                            </span>
                            {task.points > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {task.points} 积分
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
