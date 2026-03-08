import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginData, RegisterData, UserRole } from '../types/user';
import { authApi } from '../api/auth.api';
import { storage } from '../lib/storage';
import { extractErrorMessage } from '../lib/utils';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
  updateProfile: (data: { avatar?: string }) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(data);
          storage.setToken(response.token);
          storage.setUser(response.user);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message = extractErrorMessage(error, '登录失败');
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          storage.setToken(response.token);
          storage.setUser(response.user);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message = extractErrorMessage(error, '注册失败');
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        storage.clear();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User) => {
        storage.setUser(user);
        set({ user });
      },

      updateProfile: async (data: { avatar?: string }) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authApi.updateProfile(data);
          set((state) => {
            const fullUser = { ...state.user, ...updatedUser } as User;
            storage.setUser(fullUser);
            return { user: fullUser, isLoading: false };
          });
        } catch (error) {
          const message = extractErrorMessage(error, '更新资料失败');
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      changePassword: async (data: { currentPassword: string; newPassword: string }) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.changePassword(data);
          set({ isLoading: false });
        } catch (error) {
          const message = extractErrorMessage(error, '修改密码失败');
          set({ error: message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useUserRole = (): UserRole | null => {
  return useAuthStore((state) => state.user?.role ?? null);
};

export const isParent = (): boolean => {
  return useAuthStore.getState().user?.role === 'parent';
};
