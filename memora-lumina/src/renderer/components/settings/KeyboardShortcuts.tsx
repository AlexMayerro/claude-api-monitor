import React, { useState } from 'react';
import { SectionHeader, SettingRow } from './SettingsView';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { Button } from '@renderer/components/common/Button';

const ACTIONS: { key: string; label: string }[] = [
  { key: 'new_chat', label: 'New chat' },
  { key: 'search_memory', label: 'Search memory' },
  { key: 'toggle_memory_stream', label: 'Toggle Memory Stream' },
  { key: 'toggle_sidebar', label: 'Toggle sidebar' },
  { key: 'split_screen', label: 'Toggle split screen' },
  { key: 'open_settings', label: 'Open settings' },
  { key: 'close_tab', label: 'Close tab' },
  { key: 'next_tab', label: 'Next tab' },
  { key: 'prev_tab', label: 'Previous tab' },
  { key: 'focus_search', label: 'Focus search bar' },
  { key: 'toggle_theme', label: 'Toggle theme' },
];

function keyToShortcut(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.shiftKey) parts.push('Shift');
  if (e.altKey) parts.push('Alt');
  if (e.metaKey) parts.push('Meta');
  let key = e.key;
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) return '';
  if (key === ' ') key = 'Space';
  if (key.length === 1) key = key.toUpperCase();
  parts.push(key);
  return parts.join('+');
}

export const KeyboardShortcuts: React.FC = () => {
  const shortcuts = useSettingsStore((s) => s.settings.keyboard_shortcuts);
  const update = useSettingsStore((s) => s.update);
  const [editing, setEditing] = useState<string | null>(null);

  React.useEffect(() => {
    if (!editing) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const sc = keyToShortcut(e);
      if (!sc) return;
      const next = { ...shortcuts, [editing]: sc };
      update('keyboard_shortcuts', next);
      setEditing(null);
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [editing, shortcuts, update]);

  return (
    <div>
      <SectionHeader title="Keyboard shortcuts" description="Click Edit then press the key combination to bind." />
      {ACTIONS.map((a) => (
        <SettingRow key={a.key} label={a.label}>
          <div className="flex items-center gap-2">
            <kbd className="font-mono text-[12px] px-2 py-1 rounded-md bg-surface-elevated border border-border text-text-primary">
              {editing === a.key ? 'Press keys…' : shortcuts[a.key] || 'Unbound'}
            </kbd>
            <Button size="sm" variant={editing === a.key ? 'primary' : 'secondary'} onClick={() => setEditing(editing === a.key ? null : a.key)}>
              {editing === a.key ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </SettingRow>
      ))}
    </div>
  );
};
