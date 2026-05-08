import { create } from 'zustand';
import type { Settings, ApiKeys, TabId, Theme } from '../../shared/types';
import type {
  ModelInfo,
  OrgInfo,
  OrgUser,
  Workspace,
  ApiKeyEntry,
  UsageBucket,
  CostBucket,
  RateLimitHeaders,
} from '../utils/api-types';

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'disconnected';
export type UsagePeriod = 'today' | '7d' | '30d';

interface DataState {
  models: ModelInfo[];
  modelsLoaded: boolean;
  org?: OrgInfo;
  orgUsers: OrgUser[];
  workspaces: Workspace[];
  apiKeys: ApiKeyEntry[];
  usageToday: UsageBucket[];
  usage7d: UsageBucket[];
  usage30d: UsageBucket[];
  costs7d: CostBucket[];
  costs30d: CostBucket[];
  rateLimits?: RateLimitHeaders;

  apiStatus: ConnectionStatus;
  adminStatus: ConnectionStatus;
  apiError?: string;
  adminError?: string;

  lastUpdatedMs: number;
  lastProbeMs: number;
  partialData: boolean;
}

interface UiState {
  settings?: Settings;
  keys?: ApiKeys;
  resolvedTheme: 'dark' | 'light';
  systemPrefersDark: boolean;
  showSettings: boolean;
  showAccount: boolean;
  reconnectScreen: boolean;
  usagePeriod: UsagePeriod;
}

interface AppState extends DataState, UiState {
  setKeys: (k: ApiKeys) => void;
  setSettings: (s: Settings) => void;
  patchSettings: (p: Partial<Settings>) => void;
  setActiveTab: (t: TabId) => void;
  setResolvedTheme: (t: 'dark' | 'light') => void;
  setSystemPrefersDark: (b: boolean) => void;
  toggleSettingsPanel: (v?: boolean) => void;
  toggleAccountPanel: (v?: boolean) => void;
  setReconnectScreen: (v: boolean) => void;
  setUsagePeriod: (p: UsagePeriod) => void;
  setPartialData: (v: boolean) => void;
  setData: (patch: Partial<DataState>) => void;
  setApiStatus: (s: ConnectionStatus, error?: string) => void;
  setAdminStatus: (s: ConnectionStatus, error?: string) => void;
  touchUpdated: () => void;
  touchProbed: () => void;
}

export const useApp = create<AppState>((set) => ({
  models: [],
  modelsLoaded: false,
  org: undefined,
  orgUsers: [],
  workspaces: [],
  apiKeys: [],
  usageToday: [],
  usage7d: [],
  usage30d: [],
  costs7d: [],
  costs30d: [],
  rateLimits: undefined,

  apiStatus: 'disconnected',
  adminStatus: 'disconnected',

  lastUpdatedMs: 0,
  lastProbeMs: 0,
  partialData: false,

  resolvedTheme: 'dark',
  systemPrefersDark: true,
  showSettings: false,
  showAccount: false,
  reconnectScreen: false,
  usagePeriod: 'today',

  setKeys: (k) => set({ keys: k }),
  setSettings: (s) => set({ settings: s }),
  patchSettings: (p) =>
    set((state) =>
      state.settings ? { settings: { ...state.settings, ...p } } : state,
    ),
  setActiveTab: (t) =>
    set((state) =>
      state.settings ? { settings: { ...state.settings, activeTab: t } } : state,
    ),
  setResolvedTheme: (t) => set({ resolvedTheme: t }),
  setSystemPrefersDark: (b) => set({ systemPrefersDark: b }),
  toggleSettingsPanel: (v) =>
    set((state) => ({ showSettings: v !== undefined ? v : !state.showSettings })),
  toggleAccountPanel: (v) =>
    set((state) => ({ showAccount: v !== undefined ? v : !state.showAccount })),
  setReconnectScreen: (v) => set({ reconnectScreen: v }),
  setUsagePeriod: (p) => set({ usagePeriod: p }),
  setPartialData: (v) => set({ partialData: v }),
  setData: (patch) => set(patch as Partial<AppState>),
  setApiStatus: (s, error) => set({ apiStatus: s, apiError: error }),
  setAdminStatus: (s, error) => set({ adminStatus: s, adminError: error }),
  touchUpdated: () => set({ lastUpdatedMs: Date.now() }),
  touchProbed: () => set({ lastProbeMs: Date.now() }),
}));

export function selectThemePreference(state: AppState): Theme {
  return state.settings?.theme ?? 'dark';
}
