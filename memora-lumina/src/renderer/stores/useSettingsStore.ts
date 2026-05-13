import { create } from 'zustand';
import { DEFAULT_SETTINGS, type AppSettings } from '@shared/types';

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  load: () => Promise<void>;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  load: async () => {
    const settings = await window.memora.getAllSettings();
    set({ settings, loaded: true });
  },
  update: async (key, value) => {
    set((state) => ({ settings: { ...state.settings, [key]: value } }));
    try {
      await window.memora.setSetting(key, value);
    } catch (err) {
      console.error('Failed to persist setting', key, err);
      // best effort — restore on failure
      const settings = await window.memora.getAllSettings();
      set({ settings });
    }
    void get;
  },
}));
