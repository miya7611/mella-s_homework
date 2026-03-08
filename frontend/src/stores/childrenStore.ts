import { create } from 'zustand';
import type { User, CreateChildData } from '../types/user';
import { authApi } from '../api/auth.api';
import { extractErrorMessage } from '../lib/utils';

interface ChildrenState {
  children: Partial<User>[];
  isLoading: boolean;
  error: string | null;

  fetchChildren: () => Promise<void>;
  createChild: (data: CreateChildData) => Promise<Partial<User>>;
  clearError: () => void;
}

export const useChildrenStore = create<ChildrenState>((set) => ({
  children: [],
  isLoading: false,
  error: null,

  fetchChildren: async () => {
    set({ isLoading: true, error: null });
    try {
      const children = await authApi.getChildren();
      set({ children, isLoading: false });
    } catch (error) {
      const message = extractErrorMessage(error, '获取孩子列表失败');
      set({ error: message, isLoading: false });
    }
  },

  createChild: async (data: CreateChildData) => {
    set({ isLoading: true, error: null });
    try {
      const child = await authApi.createChild(data);
      set((state) => ({
        children: [...state.children, child],
        isLoading: false,
      }));
      return child;
    } catch (error) {
      const message = extractErrorMessage(error, '创建孩子账号失败');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
