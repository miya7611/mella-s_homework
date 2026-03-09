import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuthStore } from '../stores';
import { Card, CardContent } from '../components/ui/Card';
import { statsApi } from '../api/stats.api';
import type { UserStats, DailyStats } from '../types/stats';

// 计算本周一至今的天数
const getDaysThisWeek = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 周日算6天，周一算0天
  return daysFromMonday + 1; // 包含今天
};

// 计算本月1日至今的天数
const getDaysThisMonth = () => {
  const today = new Date();
  return today.getDate(); // 当前日期就是本月的天数
};

export function StatsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [days, setDays] = useState(getDaysThisWeek());
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<DailyStats[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const timeRangeLabel = timeRange === 'week' ? '周' : '月';

  const fetchUserStats = async (days: number) => {
    setIsLoading(true);
    try {
      const response = await statsApi.getUserStats(days);
      setStats(response);
      setChartData(response.daily_stats || []);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  const maxPoints = Math.max(...chartData.map((d) => d.points_earned), 1);

  useEffect(() => {
    fetchUserStats(days);
  }, [days]);

  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">数据统计</h2>
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const pointsEarned = chartData.reduce((sum, day) => sum + day.points_earned, 0);
  const pointsSpent = stats?.points_spent || 0;
  const totalTimeMinutes = chartData.reduce((sum, day) => sum + day.time_spent, 0);

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">数据统计</h2>
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setDays(getDaysThisWeek());
            setTimeRange('week');
          }}
          className={`px-4 py-2 rounded-full text-sm ${
            timeRange === 'week' ? 'bg-primary text-white' : 'bg-muted'
          }`}
        >
          本周
        </button>
        <button
          onClick={() => {
            setDays(getDaysThisMonth());
            setTimeRange('month');
          }}
          className={`px-4 py-2 rounded-full text-sm ${
            timeRange === 'month' ? 'bg-primary text-white' : 'bg-muted'
          }`}
        >
          本月
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">当前积分</p>
                <p className="text-2xl font-bold">{user?.total_points || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">本{timeRangeLabel}获得</p>
                <p className="text-2xl font-bold text-green-500">+{pointsEarned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">本{timeRangeLabel}消耗</p>
                <p className="text-2xl font-bold text-red-500">-{pointsSpent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">学习时长</p>
                <p className="text-2xl font-bold">{formatDuration(totalTimeMinutes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Stats */}
      {stats?.task_stats && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">任务统计</h3>
            <div className="grid grid-cols-5 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold">{stats.task_stats.total}</p>
                <p className="text-sm text-muted-foreground">总任务</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{stats.task_stats.completed}</p>
                <p className="text-sm text-muted-foreground">已完成</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{stats.task_stats.pending}</p>
                <p className="text-sm text-muted-foreground">待处理</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{stats.task_stats.in_progress}</p>
                <p className="text-sm text-muted-foreground">进行中</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{stats.task_stats.overtime}</p>
                <p className="text-sm text-muted-foreground">超时</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Stats Chart */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">每日统计</h3>
          {chartData.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {chartData.map((day) => {
            const percentage = (day.points_earned / maxPoints) * 100;
            return (
              <div key={day.date} className="flex items-end gap-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{formatDate(day.date)}</p>
                  <p className="text-sm font-medium">{day.tasks_completed} 任务</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-green-500 font-semibold">+{day.points_earned} 积分</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-blue-500 font-semibold">{formatDuration(day.time_spent)}</p>
                </div>
                <div className="h-2 bg-muted rounded mt-1">
                  <div
                    className="h-full bg-green-500 rounded transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/rewards/history')}
          className="flex-1 px-4 py-2 rounded-lg border bg-background hover:bg-accent text-sm"
        >
          兑换记录
        </button>
        <button
          onClick={() => navigate('/rewards/points-history')}
          className="flex-1 px-4 py-2 rounded-lg border bg-background hover:bg-accent text-sm"
        >
          积分历史
        </button>
      </div>
    </div>
  );
}
