import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import { DEFAULT_SETTINGS, type AppSettings } from '../../shared/types';

function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  const db = getDatabase();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  if (!row) return DEFAULT_SETTINGS[key];
  try {
    return JSON.parse(row.value) as AppSettings[K];
  } catch {
    return DEFAULT_SETTINGS[key];
  }
}

function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
  const db = getDatabase();
  db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(
    key,
    JSON.stringify(value),
  );
}

function getAllSettings(): AppSettings {
  const db = getDatabase();
  const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
  const out: any = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    if (r.key in DEFAULT_SETTINGS) {
      try {
        out[r.key] = JSON.parse(r.value);
      } catch {
        /* keep default */
      }
    }
  }
  return out as AppSettings;
}

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', (_event, key: keyof AppSettings) => getSetting(key));
  ipcMain.handle('settings:set', (_event, key: keyof AppSettings, value: unknown) => setSetting(key, value as never));
  ipcMain.handle('settings:getAll', () => getAllSettings());
}

export { getSetting, setSetting, getAllSettings };
