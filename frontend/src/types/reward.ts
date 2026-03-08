export interface ExchangeableReward {
  id: number;
  name: string;
  description?: string;
  required_points: number;
  required_items?: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
}

export interface RewardExchange {
  id: number;
  user_id: number;
  reward_id: number;
  reward_name: string;
  points_spent: number;
  items_spent?: string;
  status: 'pending' | 'fulfilled';
  created_at: string;
  fulfilled_at?: string;
}

export interface CreateRewardData {
  name: string;
  description?: string;
  required_points: number;
  required_items?: string;
}
