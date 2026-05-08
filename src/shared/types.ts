export type Theme = 'dark' | 'light' | 'system';
export type TabId = 'subscription' | 'api' | 'both';
export type RefreshInterval = 30 | 60 | 120 | 300;
export type ProbeInterval = 120 | 300 | 600 | 1800;

export interface Settings {
  theme: Theme;
  alwaysOnTop: boolean;
  opacity: number;
  compactMode: boolean;
  refreshInterval: RefreshInterval;
  startWithWindows: boolean;
  startMinimized: boolean;
  showNotifications: boolean;
  probeInterval: ProbeInterval;
  activeTab: TabId;
}

export interface WindowBounds {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

export interface ApiKeys {
  hasApiKey: boolean;
  hasAdminKey: boolean;
  apiKeyTail?: string;
  adminKeyTail?: string;
}

export interface AnthropicRequest {
  method: 'GET' | 'POST';
  path: string;
  query?: Record<string, string | string[] | number | undefined>;
  body?: unknown;
  useAdmin?: boolean;
}

export interface AnthropicResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  headers?: Record<string, string>;
  error?: string;
  latencyMs?: number;
}

export const IPC = {
  STORE_KEYS: 'store:keys',
  GET_KEYS_INFO: 'store:keys-info',
  CLEAR_KEYS: 'store:keys-clear',
  TEST_KEYS: 'api:test-keys',
  ANTHROPIC_REQUEST: 'api:request',

  GET_SETTINGS: 'settings:get',
  SET_SETTINGS: 'settings:set',

  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_TOGGLE_TOP: 'window:toggle-top',
  WINDOW_SET_OPACITY: 'window:set-opacity',
  WINDOW_SET_TOP: 'window:set-top',

  OPEN_EXTERNAL: 'shell:open-external',
  EXPORT_CSV: 'shell:export-csv',

  THEME_UPDATED: 'theme:updated',
  TRAY_ACTION: 'tray:action',
} as const;

export type TrayAction = 'show' | 'hide' | 'refresh' | 'settings' | 'toggle-top';
