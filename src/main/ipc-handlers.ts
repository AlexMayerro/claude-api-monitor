import { ipcMain, BrowserWindow, shell, dialog, app, nativeTheme } from 'electron';
import axios, { AxiosError } from 'axios';
import * as fs from 'node:fs';
import { IPC } from '../shared/types';
import type { AnthropicRequest, AnthropicResponse } from '../shared/types';
import { keyStore, settingsStore } from './store';

const API_BASE = 'https://api.anthropic.com';
const VERSION_HEADER = '2023-06-01';
const TIMEOUT_MS = 15000;

function buildQuery(query?: AnthropicRequest['query']): string {
  if (!query) return '';
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      for (const item of v) sp.append(k, String(item));
    } else {
      sp.append(k, String(v));
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

async function callAnthropic<T = unknown>(
  apiKey: string,
  req: AnthropicRequest,
): Promise<AnthropicResponse<T>> {
  const url = `${API_BASE}${req.path}${buildQuery(req.query)}`;
  const start = Date.now();
  try {
    const resp = await axios.request({
      method: req.method,
      url,
      data: req.body,
      timeout: TIMEOUT_MS,
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': VERSION_HEADER,
        'content-type': 'application/json',
      },
      validateStatus: () => true,
    });
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(resp.headers ?? {})) {
      if (typeof v === 'string') headers[k.toLowerCase()] = v;
      else if (Array.isArray(v)) headers[k.toLowerCase()] = v.join(',');
    }
    const ok = resp.status >= 200 && resp.status < 300;
    return {
      ok,
      status: resp.status,
      data: ok ? (resp.data as T) : undefined,
      headers,
      error: ok ? undefined : extractError(resp.data, resp.status),
      latencyMs: Date.now() - start,
    };
  } catch (e) {
    const err = e as AxiosError;
    return {
      ok: false,
      status: 0,
      error: err.message || 'Network error',
      latencyMs: Date.now() - start,
    };
  }
}

function extractError(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const d = data as { error?: { message?: string; type?: string }; message?: string };
    if (d.error?.message) return d.error.message;
    if (d.message) return d.message;
  }
  if (status === 401) return 'Invalid API key';
  if (status === 403) return 'Forbidden — admin access required';
  if (status === 429) return 'Rate limited';
  return `HTTP ${status}`;
}

export function registerIpcHandlers(getWindow: () => BrowserWindow | null) {
  ipcMain.handle(IPC.STORE_KEYS, async (_e, args: { apiKey?: string; adminKey?: string }) => {
    if (args.apiKey) keyStore.setApiKey(args.apiKey);
    if (args.adminKey) keyStore.setAdminKey(args.adminKey);
    return keyStore.getKeyInfo();
  });

  ipcMain.handle(IPC.GET_KEYS_INFO, async () => keyStore.getKeyInfo());

  ipcMain.handle(IPC.CLEAR_KEYS, async () => {
    keyStore.clearAll();
  });

  ipcMain.handle(IPC.TEST_KEYS, async (_e, args: { apiKey: string; adminKey?: string }) => {
    const apiResp = await callAnthropic(args.apiKey, {
      method: 'GET',
      path: '/v1/models',
      query: { limit: 1 },
    });
    const result: {
      apiOk: boolean;
      apiError?: string;
      adminOk?: boolean;
      adminError?: string;
    } = {
      apiOk: apiResp.ok,
      apiError: apiResp.error,
    };

    if (args.adminKey) {
      const adminResp = await callAnthropic(args.adminKey, {
        method: 'GET',
        path: '/v1/organizations/me',
      });
      result.adminOk = adminResp.ok;
      result.adminError = adminResp.error;
    }
    return result;
  });

  ipcMain.handle(IPC.ANTHROPIC_REQUEST, async (_e, req: AnthropicRequest) => {
    const key = req.useAdmin ? keyStore.getAdminKey() : keyStore.getApiKey();
    if (!key) {
      return {
        ok: false,
        status: 0,
        error: req.useAdmin ? 'No admin key configured' : 'No API key configured',
      } as AnthropicResponse;
    }
    return callAnthropic(key, req);
  });

  ipcMain.handle(IPC.GET_SETTINGS, async () => settingsStore.get());

  ipcMain.handle(IPC.SET_SETTINGS, async (_e, partial) => {
    const next = settingsStore.set(partial);
    const win = getWindow();
    if (win) {
      if (typeof partial.alwaysOnTop === 'boolean') win.setAlwaysOnTop(partial.alwaysOnTop);
      if (typeof partial.opacity === 'number') win.setOpacity(partial.opacity);
    }
    if (typeof partial.startWithWindows === 'boolean') {
      app.setLoginItemSettings({ openAtLogin: partial.startWithWindows });
    }
    return next;
  });

  ipcMain.handle(IPC.WINDOW_MINIMIZE, async () => {
    getWindow()?.minimize();
  });
  ipcMain.handle(IPC.WINDOW_CLOSE, async () => {
    getWindow()?.close();
  });
  ipcMain.handle(IPC.WINDOW_TOGGLE_TOP, async () => {
    const win = getWindow();
    if (!win) return false;
    const next = !win.isAlwaysOnTop();
    win.setAlwaysOnTop(next);
    settingsStore.set({ alwaysOnTop: next });
    return next;
  });
  ipcMain.handle(IPC.WINDOW_SET_TOP, async (_e, on: boolean) => {
    getWindow()?.setAlwaysOnTop(on);
    settingsStore.set({ alwaysOnTop: on });
  });
  ipcMain.handle(IPC.WINDOW_SET_OPACITY, async (_e, op: number) => {
    getWindow()?.setOpacity(op);
    settingsStore.set({ opacity: op });
  });

  ipcMain.handle(IPC.OPEN_EXTERNAL, async (_e, url: string) => {
    if (/^https?:\/\//i.test(url)) await shell.openExternal(url);
  });

  ipcMain.handle(IPC.EXPORT_CSV, async (_e, args: { csv: string; filename: string }) => {
    const win = getWindow();
    if (!win) return { saved: false };
    const result = await dialog.showSaveDialog(win, {
      defaultPath: args.filename,
      filters: [{ name: 'CSV', extensions: ['csv'] }],
    });
    if (result.canceled || !result.filePath) return { saved: false };
    fs.writeFileSync(result.filePath, args.csv, 'utf-8');
    return { saved: true, path: result.filePath };
  });

  nativeTheme.on('updated', () => {
    const win = getWindow();
    if (win) win.webContents.send(IPC.THEME_UPDATED, nativeTheme.shouldUseDarkColors);
  });
}
