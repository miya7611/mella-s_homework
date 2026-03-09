import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Gift, Clock } from 'lucide-react';
import { useAuthStore, useRewardStore } from '../stores';
import { Card, CardContent } from '../components/ui/Card';

export function PointsHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { pointsHistory, isLoading, fetchPointsHistory } = useRewardStore();

  useEffect(() => {
    fetchPointsHistory();
  }, [fetchPointsHistory]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'spent':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'manual':
        return <Gift className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'earned':
        return '任务奖励';
      case 'spent':
        return '兑换消耗';
      case 'manual':
        return '家长奖励';
      default:
        return '其他';
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-semibold">积分记录</h1>
      </div>

      {/* Current Points */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">当前积分</span>
            <span className="text-3xl font-bold text-yellow-500">{user?.total_points || 0}</span>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : pointsHistory.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">暂无积分记录</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pointsHistory.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        entry.type === 'earned'
                          ? 'bg-green-100'
                          : entry.type === 'spent'
                            ? 'bg-red-100'
                            : 'bg-yellow-100'
                      }`}
                    >
                      {getTypeIcon(entry.type)}
                    </div>
                    <div>
                      <p className="font-medium">{entry.description || getTypeLabel(entry.type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </p>
                      {entry.task_title && (
                        <p className="text-xs text-muted-foreground">任务: {entry.task_title}</p>
                      )}
                    </div>
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      entry.type === 'spent' ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {entry.type === 'spent' ? '-' : '+'}
                    {entry.amount}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
