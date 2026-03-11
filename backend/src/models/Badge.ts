export type BadgeType =
  | 'first_task'        // 完成第一个任务
  | 'task_master_10'    // 完成10个任务
  | 'task_master_50'    // 完成50个任务
  | 'task_master_100'   // 完成100个任务
  | 'streak_3'          // 连续3天完成任务
  | 'streak_7'          // 连续7天完成任务
  | 'streak_30'         // 连续30天完成任务
  | 'points_100'        // 获得100积分
  | 'points_500'        // 获得500积分
  | 'points_1000'       // 获得1000积分
  | 'early_bird'        // 提前完成任务
  | 'category_master';  // 单一类别完成20个任务

export interface Badge {
  id: number;
  user_id: number;
  badge_type: BadgeType;
  earned_at: string;
}

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    type: 'first_task',
    name: '初次尝试',
    description: '完成第一个任务',
    icon: '🎯',
    requirement: '完成1个任务'
  },
  {
    type: 'task_master_10',
    name: '任务新星',
    description: '完成10个任务',
    icon: '⭐',
    requirement: '完成10个任务'
  },
  {
    type: 'task_master_50',
    name: '任务达人',
    description: '完成50个任务',
    icon: '🌟',
    requirement: '完成50个任务'
  },
  {
    type: 'task_master_100',
    name: '任务大师',
    description: '完成100个任务',
    icon: '👑',
    requirement: '完成100个任务'
  },
  {
    type: 'streak_3',
    name: '三天连胜',
    description: '连续3天完成任务',
    icon: '🔥',
    requirement: '连续3天完成'
  },
  {
    type: 'streak_7',
    name: '周冠军',
    description: '连续7天完成任务',
    icon: '🏆',
    requirement: '连续7天完成'
  },
  {
    type: 'streak_30',
    name: '月度之星',
    description: '连续30天完成任务',
    icon: '💎',
    requirement: '连续30天完成'
  },
  {
    type: 'points_100',
    name: '积分新手',
    description: '累计获得100积分',
    icon: '💰',
    requirement: '获得100积分'
  },
  {
    type: 'points_500',
    name: '积分高手',
    description: '累计获得500积分',
    icon: '💎',
    requirement: '获得500积分'
  },
  {
    type: 'points_1000',
    name: '积分大师',
    description: '累计获得1000积分',
    icon: '👑',
    requirement: '获得1000积分'
  },
  {
    type: 'early_bird',
    name: '早起的鸟儿',
    description: '提前完成一个任务',
    icon: '🐦',
    requirement: '提前完成任务'
  },
  {
    type: 'category_master',
    name: '专项达人',
    description: '单一类别完成20个任务',
    icon: '📚',
    requirement: '单类别完成20个任务'
  }
];
