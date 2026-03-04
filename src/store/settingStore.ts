import { create } from 'zustand';
import type { Settings } from '../types';
import { defaultSettings } from '../types';

interface SettingStore {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  setSettings: (settings: Settings) => void;
}

export const useSettingStore = create<SettingStore>((set) => ({
  settings: defaultSettings,

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),

  setSettings: (settings) => set({ settings }),
}));
