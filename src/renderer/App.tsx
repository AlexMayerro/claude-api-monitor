import { useEffect, useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { TabBar } from './components/TabBar';
import { QuickStatsFooter } from './components/QuickStatsFooter';
import { ConnectAccount } from './components/ConnectAccount';
import { SettingsPanel } from './components/SettingsPanel';
import { AccountPanel } from './components/AccountPanel';
import { SubscriptionView } from './components/SubscriptionView';
import { ApiView } from './components/ApiView';
import { BothView } from './components/BothView';
import { useApp } from './store/appStore';
import { api } from './utils/bridge';
import { loadSettings } from './hooks/useSettings';
import { useAutoRefresh, refreshAll } from './hooks/useAutoRefresh';
import { applyTheme, getSystemPrefersDark } from './utils/theme';
import { probeRateLimits } from './hooks/useRateLimits';

export default function App() {
  const keys = useApp((s) => s.keys);
  const settings = useApp((s) => s.settings);
  const reconnect = useApp((s) => s.reconnectScreen);
  const setReconnectScreen = useApp((s) => s.setReconnectScreen);
  const setKeys = useApp((s) => s.setKeys);
  const partialData = useApp((s) => s.partialData);
  const [bootstrapped, setBootstrapped] = useState(false);

  // Bootstrap: load settings + key info
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [s, k] = await Promise.all([loadSettings(), api().getKeysInfo()]);
      if (!mounted) return;
      setKeys(k);
      // Apply theme + window properties from persisted settings
      const sysDark = getSystemPrefersDark();
      useApp.getState().setSystemPrefersDark(sysDark);
      const resolved = applyTheme(s.theme, sysDark);
      useApp.getState().setResolvedTheme(resolved);
      await api().windowSetTop(s.alwaysOnTop);
      await api().windowSetOpacity(s.opacity);
      setBootstrapped(true);
    })();
    return () => { mounted = false; };
  }, [setKeys]);

  // Listen for system theme changes
  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mql) return;
    const handler = (e: MediaQueryListEvent) => {
      useApp.getState().setSystemPrefersDark(e.matches);
      const theme = useApp.getState().settings?.theme ?? 'dark';
      useApp.getState().setResolvedTheme(applyTheme(theme, e.matches));
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Re-apply theme when settings.theme changes
  useEffect(() => {
    if (!settings) return;
    const sysDark = useApp.getState().systemPrefersDark;
    const resolved = applyTheme(settings.theme, sysDark);
    useApp.getState().setResolvedTheme(resolved);
  }, [settings?.theme]);

  // Tray actions
  useEffect(() => {
    const off = api().onTrayAction(async (action) => {
      if (action === 'refresh') {
        await refreshAll({ probe: true });
      } else if (action === 'settings') {
        useApp.getState().toggleSettingsPanel(true);
      }
    });
    return () => off();
  }, []);

  // Theme update from main (system theme follower)
  useEffect(() => {
    const off = api().onThemeUpdated((isDark) => {
      useApp.getState().setSystemPrefersDark(isDark);
      const theme = useApp.getState().settings?.theme ?? 'dark';
      useApp.getState().setResolvedTheme(applyTheme(theme, isDark));
    });
    return () => off();
  }, []);

  const connected = !!keys?.hasApiKey && !reconnect;
  useAutoRefresh(connected);

  // Probe immediately when keys arrive
  useEffect(() => {
    if (connected) probeRateLimits().catch(() => undefined);
  }, [connected]);

  if (!bootstrapped || !settings) {
    return (
      <div className="window-shell h-screen flex items-center justify-center text-[12px] text-[var(--text-secondary)]">
        Loading…
      </div>
    );
  }

  const onAddAdminKey = () => setReconnectScreen(true);
  const onConnected = () => {
    setReconnectScreen(false);
    refreshAll({ probe: true });
  };

  if (!connected || reconnect) {
    return (
      <div className="window-shell h-screen flex flex-col">
        <TitleBar />
        <ConnectAccount
          onConnected={onConnected}
          onCancel={keys?.hasApiKey ? () => setReconnectScreen(false) : undefined}
        />
      </div>
    );
  }

  const activeTab = settings.activeTab;

  return (
    <div className="window-shell h-screen flex flex-col relative">
      <TitleBar />
      <TabBar />
      <div className="flex-1 overflow-y-auto scrollarea px-3 py-3 relative">
        {partialData && (
          <div className="mb-2 px-2 py-1 rounded-md text-[10px] bg-accent-amber/15 text-accent-amber border border-accent-amber/30">
            Partial data — some pages did not load.
          </div>
        )}
        {activeTab === 'subscription' && <SubscriptionView onAddAdminKey={onAddAdminKey} />}
        {activeTab === 'api' && <ApiView />}
        {activeTab === 'both' && <BothView onAddAdminKey={onAddAdminKey} />}
      </div>
      <QuickStatsFooter />
      <SettingsPanel onChangeKeys={onAddAdminKey} />
      <AccountPanel onChangeKeys={onAddAdminKey} />
    </div>
  );
}
