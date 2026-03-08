import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { useAuthStore, useRewardStore } from '../stores';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RewardCard } from '../components/reward/RewardCard';

export function RewardsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { rewards, isLoading, fetchRewards, exchangeReward } = useRewardStore();

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const isParent = user?.role === 'parent';

  const handleExchange = async (rewardId: number) => {
    try {
      await exchangeReward(rewardId);
      alert('兑换成功！');
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">奖励商城</h2>
          <p className="text-sm text-muted-foreground">用积分兑换奖励</p>
        </div>
        {isParent && (
          <Button onClick={() => navigate('/rewards/create')} size="sm">
            创建奖励
          </Button>
        )}
      </div>

      {/* User Points */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">我的积分</span>
            <span className="text-2xl font-bold text-yellow-500">{user?.total_points || 0}</span>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Gift className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">暂无可兑换奖励</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onExchange={() => handleExchange(reward.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
