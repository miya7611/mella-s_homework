import { create } from 'zustand';
import type { Task, CreateTaskData, UpdateTaskData, TaskFilters } from '../types/task';
import { taskApi } from '../api/task.api';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;

  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  fetchTaskById: (id: number) => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<Task>;
  updateTask: (id: number, data: UpdateTaskData) => Promise<void>;
  updateTaskStatus: (id: number, status: string) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  clearError: () => void;
  clearCurrentTask: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,

  fetchTasks: async (filters?: TaskFilters) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskApi.getTasks(filters);
      set({ tasks, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error?.message || '获取任务列表失败';
      set({ error: message, isLoading: false });
    }
  },

  fetchTaskById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const task = await taskApi.getTaskById(id);
      set({ currentTask: task, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error?.message || '获取任务详情失败';
      set({ error: message, isLoading: false });
    }
  },

  createTask: async (data: CreateTaskData) => {
    set({ isLoading: true, error: null });
    try {
      const task = await taskApi.createTask(data);
      set((state) => ({
        tasks: [...state.tasks, task],
        isLoading: false,
      }));
      return task;
    } catch (error: any) {
      const message = error.response?.data?.error?.message || '创建任务失败';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateTask: async (id: number, data: UpdateTaskData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskApi.updateTask(id, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.error?.message || '更新任务失败';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateTaskStatus: async (id: number, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskApi.updateTaskStatus(id, status);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.error?.message || '更新任务状态失败';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteTask: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await taskApi.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.error?.message || '删除任务失败';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentTask: () => {
    set({ currentTask: null });
  },
}));
