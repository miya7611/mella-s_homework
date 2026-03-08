import { useEffect } from 'react';
import { useRewardStore } from '../stores';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Clock } from 'lucide-react';

export function ExchangeHistoryPage() {
  const { exchanges, isLoading, fetchExchangeHistory } = useRewardStore();

  useEffect(() => {
    fetchExchangeHistory();
  }, [fetchExchangeHistory]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-xl font-semibold mb-4">兑换记录</h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : exchanges.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">暂无兑换记录</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {exchanges.map((exchange) => (
            <Card key={exchange.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{exchange.reward_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(exchange.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 font-semibold">
                      -{exchange.points_spent} 积分
                    </span>
                    <Badge variant={exchange.status === 'fulfilled' ? 'green' : 'yellow'}>
                      {exchange.status === 'fulfilled' ? '已完成' : '待处理'}
                    </Badge>
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
