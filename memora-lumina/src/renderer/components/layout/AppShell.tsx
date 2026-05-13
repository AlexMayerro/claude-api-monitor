import React from 'react';
import { TitleBar } from './TitleBar';
import { Sidebar } from './Sidebar';
import { SplitPane } from './SplitPane';
import { useAppStore } from '@renderer/stores/useAppStore';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { ChatView } from '@renderer/components/chat/ChatView';
import { MemoryStream } from '@renderer/components/memory-stream/MemoryStream';
import { SettingsView } from '@renderer/components/settings/SettingsView';
import { useMemoryStore } from '@renderer/stores/useMemoryStore';
import { Brain } from 'lucide-react';

function renderTab(tab: ReturnType<typeof useAppStore.getState>['tabs'][number] | undefined): React.ReactElement {
  if (!tab) {
    return <EmptyState />;
  }
  switch (tab.kind) {
    case 'chat':
      return tab.conversationId ? <ChatView conversationId={tab.conversationId} /> : <EmptyState />;
    case 'memory-stream':
      return <MemoryStream />;
    case 'settings':
      return <SettingsView />;
    default:
      return <EmptyState />;
  }
}

const EmptyState: React.FC = () => (
  <div className="h-full w-full flex flex-col items-center justify-center text-text-muted gap-3">
    <Brain size={36} className="text-text-muted/50" />
    <div className="text-text-secondary text-sm">Open a chat or the Memory Stream to begin.</div>
  </div>
);

export const AppShell: React.FC = () => {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const rightTabId = useAppStore((s) => s.rightTabId);
  const sidebarPosition = useSettingsStore((s) => s.settings.sidebar_position);
  const triggerAutoJump = useMemoryStore((s) => s.triggerAutoJump);
  const memoriesRef = useMemoryStore((s) => s.memories);

  // Subtle auto-jump heuristic: when active streaming text is updated, search for keywords in memories.
  // The Memory Stream UI uses autoJumpTargetId.
  React.useEffect(() => {
    // No-op here; auto-jump is driven by Memory Stream watching chat input/responses.
    void triggerAutoJump;
    void memoriesRef;
  }, [triggerAutoJump, memoriesRef]);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const rightTab = tabs.find((t) => t.id === rightTabId);

  const content = rightTab ? (
    <SplitPane left={renderTab(activeTab)} right={renderTab(rightTab)} />
  ) : (
    renderTab(activeTab)
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary text-text-primary">
      <TitleBar />
      <div className="flex-1 min-h-0 flex">
        {sidebarPosition === 'left' && <Sidebar />}
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden bg-bg-primary">{content}</div>
        {sidebarPosition === 'right' && <Sidebar />}
      </div>
      <ToastLayer />
    </div>
  );
};

const ToastLayer: React.FC = () => {
  const toast = useAppStore((s) => s.toastMessage);
  const position = useSettingsStore((s) => s.settings.toast_position);
  if (!toast) return null;
  const posClass = position === 'top-right' ? 'top-16 right-6' : 'bottom-6 right-6';
  return (
    <div className={`fixed ${posClass} z-50 max-w-sm bg-surface-elevated border border-border rounded-md shadow-elevated px-4 py-3 text-[13px] text-text-primary animate-slide-up`}>
      {toast}
    </div>
  );
};
