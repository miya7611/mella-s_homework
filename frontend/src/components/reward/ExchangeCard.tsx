import { Clock, CheckCircle } from 'lucide-react';
import type { RewardExchange } from '../../types/reward';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

import { Button } from '../ui/Button';

interface ExchangeCardProps {
  exchange: RewardExchange;
  onFulfill?: () => void;
  isParent?: boolean;
}

export function ExchangeCard({ exchange, onFulfill, isParent }: ExchangeCardProps) {
  const isPending = exchange.status === 'pending';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-medium">{exchange.reward_name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Clock className="h-4 w-4" />
              <span>{new Date(exchange.created_at).toLocaleString('zh-CN')}</span>
            </div>
          </div>
          <Badge variant={isPending ? 'yellow' : 'green'}>
            {isPending ? '待兑现' : '已兑现'}
          </Badge>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-yellow-500">{exchange.points_spent}</span>
            <span className="text-sm text-muted-foreground">积分</span>
          </div>

          {isParent && isPending && onFulfill && (
            <Button variant="outline" size="sm" onClick={onFulfill}>
              <CheckCircle className="h-4 w-4 mr-1" />
              确认兑现
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
