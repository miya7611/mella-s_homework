import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore, useTaskStore } from '../stores';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TaskList } from '../components/task';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks, isLoading, fetchTasks } = useTaskStore();

  useEffect(() => {
    if (user) {
      fetchTasks({ userId: user.id });
    }
  }, [user, fetchTasks]);

  const todayTasks = tasks.filter(
    (t) => t.scheduled_date === new Date().toISOString().split('T')[0]
  );

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const totalPoints = user?.total_points || 0;

  const isParent = user?.role === 'parent';

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            你好，{user?.username}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isParent ? '家长' : '孩子'} · 等级 {user?.level}
          </p>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <Trophy className="h-5 w-5" />
          <span className="font-semibold">{totalPoints}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="mx-auto h-5 w-5 text-gray-500 mb-1" />
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">待处理</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto h-5 w-5 text-yellow-500 mb-1" />
            <p className="text-2xl font-bold">{inProgressCount}</p>
            <p className="text-xs text-muted-foreground">进行中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="mx-auto h-5 w-5 text-green-500 mb-1" />
            <p className="text-2xl font-bold">{completedCount}</p>
            <p className="text-xs text-muted-foreground">已完成</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">今日任务</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
              查看全部
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TaskList
            tasks={todayTasks}
            isLoading={isLoading}
            emptyMessage="今天没有任务"
          />
        </CardContent>
      </Card>

      {isParent && (
        <Button className="w-full" onClick={() => navigate('/tasks/create')}>
          创建新任务
        </Button>
      )}
    </div>
  );
}
