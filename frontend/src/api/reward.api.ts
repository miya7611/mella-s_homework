import client from './client';
import type { ApiResponse } from '../types';
import type { ExchangeableReward, RewardExchange, CreateRewardData } from '../types/reward';

export const rewardApi = {
  getRewards: async (): Promise<ExchangeableReward[]> => {
    const response = await client.get<ApiResponse<ExchangeableReward[]>>('/api/rewards');
    return response.data.data;
  },

  createReward: async (data: CreateRewardData): Promise<ExchangeableReward> => {
    const response = await client.post<ApiResponse<ExchangeableReward>>('/api/rewards', data);
    return response.data.data;
  },

  exchangeReward: async (rewardId: number): Promise<RewardExchange> => {
    const response = await client.post<ApiResponse<RewardExchange>>('/api/rewards/exchange', { reward_id: rewardId });
    return response.data.data;
  },

  getExchangeHistory: async (): Promise<RewardExchange[]> => {
    const response = await client.get<ApiResponse<RewardExchange[]>>('/api/rewards/exchanges');
    return response.data.data;
  },

  fulfillExchange: async (exchangeId: number): Promise<void> => {
    await client.patch(`/api/rewards/exchanges/${exchangeId}/fulfill`);
  },

  addPoints: async (userId: number, points: number, reason?: string): Promise<{ userId: number; pointsAdded: number; newTotal: number }> => {
    const response = await client.post<ApiResponse<{ userId: number; pointsAdded: number; newTotal: number }>>('/api/rewards/add-points', {
      user_id: userId,
      points,
      reason,
    });
    return response.data.data;
  },
};
