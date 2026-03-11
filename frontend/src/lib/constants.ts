export const TASK_CATEGORIES = [
  { value: 'homework', label: '作业', icon: '📚' },
  { value: 'reading', label: '阅读', icon: '📖' },
  { value: 'exercise', label: '运动', icon: '🏃' },
  { value: 'chores', label: '家务', icon: '🧹' },
  { value: 'practice', label: '练习', icon: '✏️' },
  { value: 'other', label: '其他', icon: '📋' },
] as const;

export const TASK_STATUS: Record<string, { label: string; color: 'gray' | 'blue' | 'yellow' | 'green' | 'red' | 'orange' | 'purple' }> = {
  pending: { label: '待处理', color: 'gray' },
  planned: { label: '已计划', color: 'blue' },
  in_progress: { label: '进行中', color: 'yellow' },
  pending_review: { label: '待审核', color: 'orange' },
  completed: { label: '已完成', color: 'green' },
  rejected: { label: '已驳回', color: 'red' },
  overtime: { label: '超时', color: 'purple' },
};

export type TaskStatusValue = keyof typeof TASK_STATUS;
export type TaskCategoryValue = typeof TASK_CATEGORIES[number]['value'];

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
