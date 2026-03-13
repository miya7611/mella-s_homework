import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';
import { useAuthStore } from '../stores';
import { Card, CardContent } from '../components/ui/Card';
import { statsApi } from '../api/stats.api';
import type { UserStats, DailyStats } from '../types/stats';

// Chart colors
const COLORS = {
  completed: '#22c55e',
  pending: '#eab308',
  in_progress: '#3b82f6',
  overtime: '#ef4444',
  rejected: '#6b7280',
};

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

  useEffect(() => {
    fetchUserStats(days);
  }, [days]);

  // Prepare pie chart data for task status distribution
  const pieData = stats?.task_stats ? [
    { name: '已完成', value: stats.task_stats.completed, color: COLORS.completed },
    { name: '待处理', value: stats.task_stats.pending, color: COLORS.pending },
    { name: '进行中', value: stats.task_stats.in_progress, color: COLORS.in_progress },
    { name: '超时', value: stats.task_stats.overtime, color: COLORS.overtime },
  ].filter(item => item.value > 0) : [];

  // Prepare bar chart data for daily tasks
  const barData = chartData.map(day => ({
    date: formatDate(day.date),
    tasks: day.tasks_completed,
    points: day.points_earned,
  }));

  // Prepare area chart data for points trend
  const areaData = chartData.map(day => ({
    date: formatDate(day.date),
    积分: day.points_earned,
    时长: Math.round(day.time_spent / 60 * 10) / 10, // Convert to hours with 1 decimal
  }));

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

      {/* Task Status Distribution - Pie Chart */}
      {stats?.task_stats && pieData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">任务状态分布</h3>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1 border-t">
                  <span className="text-sm text-muted-foreground">总计</span>
                  <span className="text-sm font-medium ml-auto">{stats.task_stats.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Tasks Bar Chart */}
      {barData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">每日完成任务</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="tasks"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="完成任务"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points Trend Area Chart */}
      {areaData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">积分趋势</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="积分"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Stats Detail List */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">每日详情</h3>
          {chartData.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {chartData.map((day) => (
                <div key={day.date} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                  <div className="w-16">
                    <p className="text-sm font-medium">{formatDate(day.date)}</p>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-500">{day.tasks_completed}</p>
                      <p className="text-xs text-muted-foreground">任务</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-500">+{day.points_earned}</p>
                      <p className="text-xs text-muted-foreground">积分</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-500">{formatDuration(day.time_spent)}</p>
                      <p className="text-xs text-muted-foreground">时长</p>
                    </div>
                  </div>
                </div>
              ))}
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
