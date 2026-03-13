import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationSettings {
  enabled: boolean;
  taskDueReminder: boolean;
  taskDueReminderMinutes: number; // Minutes before task due
  taskOverdue: boolean;
  taskAssigned: boolean;
  taskCompleted: boolean;
  pointsEarned: boolean;
}

interface NotificationSettingsState {
  settings: NotificationSettings;
  permissionGranted: boolean;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  setPermissionGranted: (granted: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  taskDueReminder: true,
  taskDueReminderMinutes: 30, // 30 minutes before due
  taskOverdue: true,
  taskAssigned: true,
  taskCompleted: false,
  pointsEarned: false,
};

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      permissionGranted: false,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      setPermissionGranted: (granted) => set({ permissionGranted: granted }),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'notification-settings',
    }
  )
);
