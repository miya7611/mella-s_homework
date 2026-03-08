import { create } from 'zustand';
import type { ExchangeableReward, RewardExchange } from '../types/reward';
import { rewardApi } from '../api/reward.api';
import { extractErrorMessage } from '../lib/utils';

interface RewardState {
  rewards: ExchangeableReward[];
  exchanges: RewardExchange[];
  isLoading: boolean;
  error: string | null;

  fetchRewards: () => Promise<void>;
  fetchExchangeHistory: () => Promise<void>;
  exchangeReward: (rewardId: number) => Promise<RewardExchange>;
  createReward: (data: { name: string; description?: string; required_points: number }) => Promise<ExchangeableReward>;
  clearError: () => void;
}

export const useRewardStore = create<RewardState>()((set) => ({
  rewards: [],
  exchanges: [],
  isLoading: false,
  error: null,

  fetchRewards: async () => {
    set({ isLoading: true, error: null });
    try {
      const rewards = await rewardApi.getRewards();
      set({ rewards, isLoading: false });
    } catch (error) {
      const message = extractErrorMessage(error, '获取奖励列表失败');
      set({ error: message, isLoading: false });
    }
  },

  fetchExchangeHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const exchanges = await rewardApi.getExchangeHistory();
      set({ exchanges, isLoading: false });
    } catch (error) {
      const message = extractErrorMessage(error, '获取兑换记录失败');
      set({ error: message, isLoading: false });
    }
  },

  exchangeReward: async (rewardId: number) => {
    set({ isLoading: true, error: null });
    try {
      const exchange = await rewardApi.exchangeReward(rewardId);
      set((state) => ({
        exchanges: [...state.exchanges, exchange],
        isLoading: false,
      }));
      return exchange;
    } catch (error) {
      const message = extractErrorMessage(error, '兑换奖励失败');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createReward: async (data: { name: string; description?: string; required_points: number }) => {
    set({ isLoading: true, error: null });
    try {
      const reward = await rewardApi.createReward(data);
      set((state) => ({
        rewards: [...state.rewards, reward],
        isLoading: false,
      }));
      return reward;
    } catch (error) {
      const message = extractErrorMessage(error, '创建奖励失败');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
