import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SoundSettings {
  enabled: boolean;
  volume: number;
  startSound: boolean;
  completeSound: boolean;
  timeoutSound: boolean;
  tickSound: boolean;
  levelUpSound: boolean;
}

interface SoundSettingsState {
  settings: SoundSettings;
  updateSettings: (settings: Partial<SoundSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: SoundSettings = {
  enabled: true,
  volume: 0.5,
  startSound: true,
  completeSound: true,
  timeoutSound: true,
  tickSound: false,
  levelUpSound: true,
};

export const useSoundSettingsStore = create<SoundSettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'sound-settings',
    }
  )
);
