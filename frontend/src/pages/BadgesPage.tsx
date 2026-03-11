import { useEffect, useState } from 'react';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../types/badge';

const BADGE_INFO: Record<string, { name: string; description: string; icon: string; requirement: string }> = {
  first_task: {
    name: '初次尝试',
    description: '完成第一个任务',
    icon: '🎯',
    requirement: '完成1个任务'
  },
  task_master_10: {
    name: '任务新星',
    description: '完成10个任务',
    icon: '⭐',
    requirement: '完成10个任务'
  },
  task_master_50: {
    name: '任务达人',
    description: '完成50个任务',
    icon: '🌟',
    requirement: '完成50个任务'
  },
  task_master_100: {
    name: '任务大师',
    description: '完成100个任务',
    icon: '👑',
    requirement: '完成100个任务'
  },
  streak_3: {
    name: '三天连胜',
    description: '连续3天完成任务',
    icon: '🔥',
    requirement: '连续3天完成'
  },
  streak_7: {
    name: '周冠军',
    description: '连续7天完成任务',
    icon: '🏆',
    requirement: '连续7天完成'
  },
  streak_30: {
    name: '月度之星',
    description: '连续30天完成任务',
    icon: '💎',
    requirement: '连续30天完成'
  },
  points_100: {
    name: '积分新手',
    description: '累计获得100积分',
    icon: '💰',
    requirement: '获得100积分'
  },
  points_500: {
    name: '积分高手',
    description: '累计获得500积分',
    icon: '💎',
    requirement: '获得500积分'
  },
  points_1000: {
    name: '积分大师',
    description: '累计获得1000积分',
    icon: '👑',
    requirement: '获得1000积分'
  },
  early_bird: {
    name: '早起的鸟儿',
    description: '提前完成一个任务',
    icon: '🐦',
    requirement: '提前完成任务'
  },
  category_master: {
    name: '专项达人',
    description: '单一类别完成20个任务',
    icon: '📚',
    requirement: '单类别完成20个任务'
  }
};

export function BadgesPage() {
  const { user } = useAuthStore();
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/badges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEarnedBadges(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBadges = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/badges/check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setNewBadges(data.data);
        fetchBadges();
      } else {
        alert('暂无新徽章');
      }
    } catch (error) {
      console.error('Failed to check badges:', error);
    }
  };

  const earnedTypes = earnedBadges.map(b => b.badge_type);
  const allBadgeTypes = Object.keys(BADGE_INFO);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          徽章成就
        </h1>
        <Button onClick={checkBadges} variant="outline" size="sm">
          <CheckCircle className="h-4 w-4 mr-1" />
          检查徽章
        </Button>
      </div>

      {/* New Badge Notification */}
      {newBadges.length > 0 && (
        <Card className="mb-4 border-yellow-400 bg-yellow-50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-yellow-700 mb-2">🎉 恭喜获得新徽章！</p>
              <div className="flex justify-center gap-4 flex-wrap">
                {newBadges.map(badge => {
                  const info = BADGE_INFO[badge.badge_type];
                  return (
                    <div key={badge.id} className="text-center">
                      <span className="text-3xl">{info?.icon || '🏅'}</span>
                      <p className="text-sm font-medium mt-1">{info?.name}</p>
                    </div>
                  );
                })}
              </div>
              <Button
                className="mt-3"
                onClick={() => setNewBadges([])}
                size="sm"
              >
                太棒了！
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{earnedBadges.length}</p>
              <p className="text-sm text-muted-foreground">已获得</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">{allBadgeTypes.length - earnedBadges.length}</p>
              <p className="text-sm text-muted-foreground">待解锁</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{allBadgeTypes.length}</p>
              <p className="text-sm text-muted-foreground">总计</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">已获得徽章</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earnedBadges.map(badge => {
              const info = BADGE_INFO[badge.badge_type];
              return (
                <Card key={badge.id} className="bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardContent className="p-4 text-center">
                    <span className="text-4xl">{info?.icon || '🏅'}</span>
                    <h3 className="font-semibold mt-2">{info?.name || badge.badge_type}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{info?.description}</p>
                    <p className="text-xs text-green-600 mt-2">
                      获得于 {formatDate(badge.earned_at)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          待解锁徽章
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allBadgeTypes
            .filter(type => !earnedTypes.includes(type as any))
            .map(type => {
              const info = BADGE_INFO[type];
              return (
                <Card key={type} className="opacity-60">
                  <CardContent className="p-4 text-center">
                    <span className="text-4xl grayscale">{info?.icon || '🏅'}</span>
                    <h3 className="font-semibold mt-2 text-muted-foreground">{info?.name || type}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{info?.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {info?.requirement}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
}
