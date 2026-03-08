import { create } from 'zustand';
import type { TimeLog } from '../types/time';
import { timeApi } from '../api/time.api';
import { extractErrorMessage } from '../lib/utils';

interface TimeState {
  timeLogs: TimeLog[];
  currentTimer: TimeLog | null;
  isLoading: boolean;
  error: string | null;

  fetchTimeLogsByTask: (taskId: number) => Promise<void>;
  fetchMyTimeLogs: () => Promise<void>;
  startTimeLog: (taskId: number, notes?: string) => Promise<TimeLog>;
  stopTimeLog: (id: number, suggestedDuration?: number) => Promise<void>;
  deleteTimeLog: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useTimeStore = create<TimeState>((set) => ({
  timeLogs: [],
  currentTimer: null,
  isLoading: false,
  error: null,

  fetchTimeLogsByTask: async (taskId: number) => {
    set({ isLoading: true, error: null });
    try {
      const timeLogs = await timeApi.getTimeLogsByTask(taskId);
      set({ timeLogs, isLoading: false });
    } catch (error) {
      const message = extractErrorMessage(error, '获取时间记录失败');
      set({ error: message, isLoading: false });
    }
  },

  fetchMyTimeLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const timeLogs = await timeApi.getMyTimeLogs();
      set({ timeLogs, isLoading: false });
    } catch (error) {
      const message = extractErrorMessage(error, '获取时间记录失败');
      set({ error: message, isLoading: false });
    }
  },

  startTimeLog: async (taskId: number, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const timeLog = await timeApi.startTimeLog(taskId, notes);
      set((state) => ({
        timeLogs: [timeLog, ...state.timeLogs],
        currentTimer: timeLog,
        isLoading: false,
      }));
      return timeLog;
    } catch (error) {
      const message = extractErrorMessage(error, '开始计时失败');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  stopTimeLog: async (id: number, suggestedDuration?: number) => {
    set({ isLoading: true, error: null });
    try {
      const updatedLog = await timeApi.stopTimeLog(id, suggestedDuration);
      set((state) => ({
        timeLogs: state.timeLogs.map((log) =>
          log.id === id ? updatedLog : log
        ),
        currentTimer: state.currentTimer?.id === id ? null : state.currentTimer,
        isLoading: false,
      }));
    } catch (error) {
      const message = extractErrorMessage(error, '停止计时失败');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteTimeLog: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await timeApi.deleteTimeLog(id);
      set((state) => ({
        timeLogs: state.timeLogs.filter((log) => log.id !== id),
        currentTimer: state.currentTimer?.id === id ? null : state.currentTimer,
        isLoading: false,
      }));
    } catch (error) {
      const message = extractErrorMessage(error, '删除时间记录失败');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
