import { useApp } from '../store/appStore';
import { api } from '../utils/bridge';
import type { Settings } from '../../shared/types';

export async function loadSettings(): Promise<Settings> {
  const settings = await api().getSettings();
  useApp.getState().setSettings(settings);
  return settings;
}

export async function updateSettings(partial: Partial<Settings>): Promise<void> {
  const next = await api().setSettings(partial);
  useApp.getState().setSettings(next);
}
