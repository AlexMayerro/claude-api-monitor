import { useEffect } from 'react';
import { useAppStore } from '@renderer/stores/useAppStore';
import { useChatStore } from '@renderer/stores/useChatStore';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';

function shortcutMatches(e: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split('+').map((p) => p.trim().toLowerCase());
  const ctrl = parts.includes('ctrl');
  const shift = parts.includes('shift');
  const alt = parts.includes('alt');
  const meta = parts.includes('meta') || parts.includes('cmd');
  const key = parts.filter((p) => !['ctrl', 'shift', 'alt', 'meta', 'cmd'].includes(p))[0];
  if (e.ctrlKey !== ctrl) return false;
  if (e.shiftKey !== shift) return false;
  if (e.altKey !== alt) return false;
  if (e.metaKey !== meta) return false;
  if (!key) return false;
  if (key === 'tab') return e.key === 'Tab';
  return e.key.toLowerCase() === key.toLowerCase();
}

export function useKeyboardShortcuts(): void {
  const shortcuts = useSettingsStore((s) => s.settings.keyboard_shortcuts);
  const openTab = useAppStore((s) => s.openTab);
  const closeTab = useAppStore((s) => s.closeTab);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const tabs = useAppStore((s) => s.tabs);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const updateSetting = useSettingsStore((s) => s.update);
  const currentTheme = useSettingsStore((s) => s.settings.theme);
  const createConversation = useChatStore((s) => s.createConversation);
  const rightTabId = useAppStore((s) => s.rightTabId);
  const splitWithTab = useAppStore((s) => s.splitWithTab);
  const unsplit = useAppStore((s) => s.unsplit);

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if (shortcutMatches(e, shortcuts.new_chat)) {
        e.preventDefault();
        const conv = await createConversation();
        openTab({ kind: 'chat', title: conv.title, conversationId: conv.id });
      } else if (shortcutMatches(e, shortcuts.toggle_memory_stream)) {
        e.preventDefault();
        openTab({ kind: 'memory-stream', title: 'Memory Stream' });
      } else if (shortcutMatches(e, shortcuts.toggle_sidebar)) {
        e.preventDefault();
        toggleSidebar();
      } else if (shortcutMatches(e, shortcuts.open_settings)) {
        e.preventDefault();
        openTab({ kind: 'settings', title: 'Settings' });
      } else if (shortcutMatches(e, shortcuts.close_tab)) {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      } else if (shortcutMatches(e, shortcuts.next_tab)) {
        e.preventDefault();
        const idx = tabs.findIndex((t) => t.id === activeTabId);
        if (idx !== -1 && tabs.length > 1) setActiveTab(tabs[(idx + 1) % tabs.length].id);
      } else if (shortcutMatches(e, shortcuts.prev_tab)) {
        e.preventDefault();
        const idx = tabs.findIndex((t) => t.id === activeTabId);
        if (idx !== -1 && tabs.length > 1) setActiveTab(tabs[(idx - 1 + tabs.length) % tabs.length].id);
      } else if (shortcutMatches(e, shortcuts.toggle_theme)) {
        e.preventDefault();
        updateSetting('theme', currentTheme === 'dark' ? 'light' : 'dark');
      } else if (shortcutMatches(e, shortcuts.split_screen)) {
        e.preventDefault();
        if (rightTabId) unsplit();
        else if (activeTabId) {
          // Split with the Memory Stream tab if available, else create one
          const memTab = tabs.find((t) => t.kind === 'memory-stream');
          if (memTab && memTab.id !== activeTabId) splitWithTab(memTab.id);
          else {
            const id = openTab({ kind: 'memory-stream', title: 'Memory Stream' });
            splitWithTab(id);
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    shortcuts, activeTabId, tabs, rightTabId, currentTheme,
    openTab, closeTab, setActiveTab, toggleSidebar, updateSetting, createConversation, splitWithTab, unsplit,
  ]);
}
