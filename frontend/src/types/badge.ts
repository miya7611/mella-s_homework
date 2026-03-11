export type BadgeType =
  | 'first_task'
  | 'task_master_10'
  | 'task_master_50'
  | 'task_master_100'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'points_100'
  | 'points_500'
  | 'points_1000'
  | 'early_bird'
  | 'category_master';

export interface Badge {
  id: number;
  user_id: number;
  badge_type: BadgeType;
  earned_at: string;
  name?: string;
  description?: string;
  icon?: string;
}

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface BadgeStats {
  totalBadges: number;
  earnedBadges: number;
  badges: (BadgeDefinition & { earned: boolean; earnedAt: string | null })[];
}
