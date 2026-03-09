import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Plus, History } from 'lucide-react';
import { useAuthStore, useRewardStore, useChildrenStore } from '../stores';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RewardCard } from '../components/reward/RewardCard';
import { rewardApi } from '../api/reward.api';
import { extractErrorMessage } from '../lib/utils';

export function RewardsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { rewards, isLoading, fetchRewards, exchangeReward } = useRewardStore();
  const { children, fetchChildren } = useChildrenStore();

  const [showAddPoints, setShowAddPoints] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [reason, setReason] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isParent = user?.role === 'parent';

  useEffect(() => {
    fetchRewards();
    if (isParent) {
      fetchChildren();
    }
  }, [fetchRewards, fetchChildren, isParent]);

  const handleExchange = async (rewardId: number) => {
    try {
      await exchangeReward(rewardId);
      setSuccess('兑换成功！');
    } catch {
      // Error handled by store
    }
  };

  const handleAddPoints = async () => {
    if (!selectedChildId || !pointsToAdd || Number(pointsToAdd) <= 0) {
      setError('请选择孩子并输入有效的积分数量');
      return;
    }

    setIsAdding(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await rewardApi.addPoints(
        selectedChildId,
        Number(pointsToAdd),
        reason || undefined
      );
      setSuccess(`成功添加 ${result.pointsAdded} 积分！`);
      setPointsToAdd('');
      setReason('');
      setShowAddPoints(false);
    } catch (err) {
      setError(extractErrorMessage(err, '添加积分失败'));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">奖励商城</h2>
          <p className="text-sm text-muted-foreground">用积分兑换奖励</p>
        </div>
        <div className="flex gap-2">
          {isParent && (
            <>
              <Button
                onClick={() => setShowAddPoints(!showAddPoints)}
                variant={showAddPoints ? 'default' : 'outline'}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                加积分
              </Button>
              <Button onClick={() => navigate('/rewards/create')} size="sm">
                创建奖励
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/rewards/history')}
          >
            <History className="h-4 w-4 mr-1" />
            记录
          </Button>
        </div>
      </div>

      {/* Add Points Panel (Parent only) */}
      {isParent && showAddPoints && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">手动添加积分</h3>
            <p className="text-sm text-muted-foreground mb-4">
              对孩子进行额外奖励，例如表现好、帮忙做家务等
            </p>

            {error && (
              <div className="mb-3 p-2 rounded bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-3 p-2 rounded bg-green-100 text-green-700 text-sm">
                {success}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">选择孩子</label>
                <select
                  value={selectedChildId || ''}
                  onChange={(e) => setSelectedChildId(Number(e.target.value) || null)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">请选择...</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">积分数量</label>
                <input
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(e.target.value)}
                  placeholder="输入要添加的积分"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  min="1"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">原因（可选）</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="例如：帮忙做家务"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddPoints(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  onClick={handleAddPoints}
                  isLoading={isAdding}
                  className="flex-1"
                >
                  添加积分
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
