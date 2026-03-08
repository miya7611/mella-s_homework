import { Gift } from 'lucide-react';
import type { ExchangeableReward } from '../../types/reward';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface RewardCardProps {
  reward: ExchangeableReward;
  onExchange?: () => void;
}

export function RewardCard({ reward, onExchange }: RewardCardProps) {
  return (
    <Card className={onExchange ? 'cursor-pointer' : undefined}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
            <Gift className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{reward.name}</h3>
            {reward.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{reward.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-yellow-500">{reward.required_points}</span>
            <span className="text-sm text-muted-foreground">积分</span>
          </div>
        </div>

        {onExchange && (
          <Button onClick={onExchange} size="sm" className="mt-2">
            兑换
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
