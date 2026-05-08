import Store from 'electron-store';
import { safeStorage } from 'electron';
import type { Settings, WindowBounds, TabId } from '../shared/types';

interface StoreSchema {
  encryptedApiKey?: string;
  encryptedAdminKey?: string;
  apiKeyTail?: string;
  adminKeyTail?: string;
  settings: Settings;
  windowBounds?: WindowBounds;
}

const defaultSettings: Settings = {
  theme: 'dark',
  alwaysOnTop: true,
  opacity: 1,
  compactMode: false,
  refreshInterval: 60,
  startWithWindows: false,
  startMinimized: false,
  showNotifications: true,
  probeInterval: 300,
  activeTab: 'subscription',
};

const store = new Store<StoreSchema>({
  name: 'claude-monitor',
  defaults: { settings: defaultSettings },
});

function encrypt(value: string): string {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(value).toString('base64');
  }
  // Fallback: base64 (still better than plaintext on disk for casual viewers)
  return Buffer.from(value, 'utf-8').toString('base64');
}

function decrypt(value: string): string {
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(Buffer.from(value, 'base64'));
    }
    return Buffer.from(value, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

export const keyStore = {
  setApiKey(key: string) {
    store.set('encryptedApiKey', encrypt(key));
    store.set('apiKeyTail', key.slice(-4));
  },
  setAdminKey(key: string) {
    store.set('encryptedAdminKey', encrypt(key));
    store.set('adminKeyTail', key.slice(-4));
  },
  getApiKey(): string | undefined {
    const v = store.get('encryptedApiKey');
    return v ? decrypt(v) || undefined : undefined;
  },
  getAdminKey(): string | undefined {
    const v = store.get('encryptedAdminKey');
    return v ? decrypt(v) || undefined : undefined;
  },
  getKeyInfo() {
    return {
      hasApiKey: !!store.get('encryptedApiKey'),
      hasAdminKey: !!store.get('encryptedAdminKey'),
      apiKeyTail: store.get('apiKeyTail'),
      adminKeyTail: store.get('adminKeyTail'),
    };
  },
  clearAll() {
    store.delete('encryptedApiKey');
    store.delete('encryptedAdminKey');
    store.delete('apiKeyTail');
    store.delete('adminKeyTail');
  },
};

export const settingsStore = {
  get(): Settings {
    return { ...defaultSettings, ...store.get('settings') };
  },
  set(partial: Partial<Settings>) {
    const current = settingsStore.get();
    const next = { ...current, ...partial };
    store.set('settings', next);
    return next;
  },
  setActiveTab(tab: TabId) {
    settingsStore.set({ activeTab: tab });
  },
};

export const windowStore = {
  getBounds(): WindowBounds {
    return store.get('windowBounds') ?? { width: 440, height: 720 };
  },
  setBounds(bounds: WindowBounds) {
    store.set('windowBounds', bounds);
  },
};
