import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/types';
import type {
  AnthropicRequest,
  AnthropicResponse,
  Settings,
  ApiKeys,
  TrayAction,
} from '../shared/types';

const api = {
  storeKeys: (apiKey?: string, adminKey?: string): Promise<ApiKeys> =>
    ipcRenderer.invoke(IPC.STORE_KEYS, { apiKey, adminKey }),
  getKeysInfo: (): Promise<ApiKeys> => ipcRenderer.invoke(IPC.GET_KEYS_INFO),
  clearKeys: (): Promise<void> => ipcRenderer.invoke(IPC.CLEAR_KEYS),
  testKeys: (apiKey: string, adminKey?: string): Promise<{
    apiOk: boolean;
    apiError?: string;
    adminOk?: boolean;
    adminError?: string;
  }> => ipcRenderer.invoke(IPC.TEST_KEYS, { apiKey, adminKey }),

  request: <T = unknown>(req: AnthropicRequest): Promise<AnthropicResponse<T>> =>
    ipcRenderer.invoke(IPC.ANTHROPIC_REQUEST, req),

  getSettings: (): Promise<Settings> => ipcRenderer.invoke(IPC.GET_SETTINGS),
  setSettings: (partial: Partial<Settings>): Promise<Settings> =>
    ipcRenderer.invoke(IPC.SET_SETTINGS, partial),

  windowMinimize: (): Promise<void> => ipcRenderer.invoke(IPC.WINDOW_MINIMIZE),
  windowClose: (): Promise<void> => ipcRenderer.invoke(IPC.WINDOW_CLOSE),
  windowToggleTop: (): Promise<boolean> => ipcRenderer.invoke(IPC.WINDOW_TOGGLE_TOP),
  windowSetTop: (on: boolean): Promise<void> => ipcRenderer.invoke(IPC.WINDOW_SET_TOP, on),
  windowSetOpacity: (op: number): Promise<void> => ipcRenderer.invoke(IPC.WINDOW_SET_OPACITY, op),

  openExternal: (url: string): Promise<void> => ipcRenderer.invoke(IPC.OPEN_EXTERNAL, url),
  exportCsv: (csv: string, filename: string): Promise<{ saved: boolean; path?: string }> =>
    ipcRenderer.invoke(IPC.EXPORT_CSV, { csv, filename }),

  onThemeUpdated: (cb: (isDark: boolean) => void): (() => void) => {
    const handler = (_e: unknown, isDark: boolean) => cb(isDark);
    ipcRenderer.on(IPC.THEME_UPDATED, handler);
    return () => {
      ipcRenderer.removeListener(IPC.THEME_UPDATED, handler);
    };
  },
  onTrayAction: (cb: (action: TrayAction) => void): (() => void) => {
    const handler = (_e: unknown, action: TrayAction) => cb(action);
    ipcRenderer.on(IPC.TRAY_ACTION, handler);
    return () => {
      ipcRenderer.removeListener(IPC.TRAY_ACTION, handler);
    };
  },
};

contextBridge.exposeInMainWorld('claudeMonitor', api);

export type ClaudeMonitorApi = typeof api;
