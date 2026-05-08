import { Settings as SettingsIcon, UserCircle2 } from 'lucide-react';
import { useApp } from '../store/appStore';
import type { TabId } from '../../shared/types';
import { updateSettings } from '../hooks/useSettings';

const TABS: { id: TabId; label: string }[] = [
  { id: 'subscription', label: 'Subscription' },
  { id: 'api', label: 'API' },
  { id: 'both', label: 'Both' },
];

export function TabBar() {
  const active = useApp((s) => s.settings?.activeTab ?? 'subscription');
  const toggleSettings = useApp((s) => s.toggleSettingsPanel);
  const toggleAccount = useApp((s) => s.toggleAccountPanel);

  const setActive = (id: TabId) => {
    useApp.getState().setActiveTab(id);
    updateSettings({ activeTab: id });
  };

  return (
    <div className="flex items-center justify-between h-[36px] border-b border-[var(--border)] bg-[var(--bg-primary)] px-2">
      <div className="flex items-center h-full">
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`relative px-3 h-full text-[12px] font-medium transition-colors ${
                isActive
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t.label}
              {isActive && (
                <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-accent-blue rounded-t" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => toggleAccount()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          title="Account"
        >
          <UserCircle2 size={15} />
        </button>
        <button
          onClick={() => toggleSettings()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          title="Settings"
        >
          <SettingsIcon size={15} />
        </button>
      </div>
    </div>
  );
}
