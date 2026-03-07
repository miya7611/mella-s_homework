export const TASK_CATEGORIES = [
  { value: 'homework', label: '作业', icon: '📚' },
  { value: 'reading', label: '阅读', icon: '📖' },
  { value: 'exercise', label: '运动', icon: '🏃' },
  { value: 'chores', label: '家务', icon: '🧹' },
  { value: 'practice', label: '练习', icon: '✏️' },
  { value: 'other', label: '其他', icon: '📋' },
] as const;

export const TASK_STATUS = {
  pending: { label: '待处理', color: 'gray' },
  planned: { label: '已计划', color: 'blue' },
  in_progress: { label: '进行中', color: 'yellow' },
  completed: { label: '已完成', color: 'green' },
  overtime: { label: '超时', color: 'red' },
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
