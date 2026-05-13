import React, { useState } from 'react';
import { Palette, MessageSquare, Brain, Sparkles, Bell, Shield, Layout, Keyboard, Wrench } from 'lucide-react';
import { cn } from '@renderer/lib/utils';
import { AppearanceSettings } from './AppearanceSettings';
import { ChatSettings } from './ChatSettings';
import { MemorySettings } from './MemorySettings';
import { MemoryStreamSettings } from './MemoryStreamSettings';
import { NotificationSettings } from './NotificationSettings';
import { PrivacySettings } from './PrivacySettings';
import { TabLayoutSettings } from './TabLayoutSettings';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { AdvancedSettings } from './AdvancedSettings';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette, Component: AppearanceSettings },
  { id: 'chat', label: 'Chat', icon: MessageSquare, Component: ChatSettings },
  { id: 'memory', label: 'Memory', icon: Brain, Component: MemorySettings },
  { id: 'stream', label: 'Memory Stream', icon: Sparkles, Component: MemoryStreamSettings },
  { id: 'notifications', label: 'Notifications', icon: Bell, Component: NotificationSettings },
  { id: 'privacy', label: 'Privacy & Data', icon: Shield, Component: PrivacySettings },
  { id: 'tabs', label: 'Tabs & Layout', icon: Layout, Component: TabLayoutSettings },
  { id: 'keyboard', label: 'Keyboard', icon: Keyboard, Component: KeyboardShortcuts },
  { id: 'advanced', label: 'Advanced', icon: Wrench, Component: AdvancedSettings },
];

export const SettingsView: React.FC = () => {
  const [active, setActive] = useState(SECTIONS[0].id);
  const ActiveComponent = SECTIONS.find((s) => s.id === active)?.Component || AppearanceSettings;
  return (
    <div className="h-full flex bg-bg-primary">
      <aside className="w-56 border-r border-border bg-bg-secondary py-3 overflow-y-auto">
        <div className="px-4 mb-2 text-[10.5px] uppercase tracking-wide text-text-muted font-semibold">Settings</div>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={cn(
              'w-full flex items-center gap-2 px-4 h-9 text-[13px] transition-colors text-left',
              active === s.id ? 'bg-accent-subtle text-text-primary border-l-2 border-accent' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary border-l-2 border-transparent',
            )}
          >
            <s.icon size={14} /> {s.label}
          </button>
        ))}
      </aside>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

interface RowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingRow: React.FC<RowProps> = ({ label, description, children }) => (
  <div className="flex items-start gap-6 py-4 border-b border-border-subtle last:border-0">
    <div className="flex-1 min-w-0">
      <div className="text-[13.5px] font-medium text-text-primary">{label}</div>
      {description ? <div className="text-[12.5px] text-text-secondary mt-0.5">{description}</div> : null}
    </div>
    <div className="flex-shrink-0 min-w-[220px] flex items-center justify-end gap-2">{children}</div>
  </div>
);

export const SectionHeader: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold tracking-tight text-text-primary">{title}</h2>
    {description ? <p className="text-text-secondary text-[13px] mt-1">{description}</p> : null}
  </div>
);
