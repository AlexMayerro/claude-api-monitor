import React from 'react';
import { TitleBar } from './TitleBar';
import { Sidebar } from './Sidebar';
import { SplitPane } from './SplitPane';
import { useAppStore } from '@renderer/stores/useAppStore';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { useChatStore } from '@renderer/stores/useChatStore';
import { ChatView } from '@renderer/components/chat/ChatView';
import { MemoryStream } from '@renderer/components/memory-stream/MemoryStream';
import { SettingsView } from '@renderer/components/settings/SettingsView';
import { useMemoryStore } from '@renderer/stores/useMemoryStore';
import { Brain, Plus } from 'lucide-react';

function renderTab(tab: ReturnType<typeof useAppStore.getState>['tabs'][number] | undefined): React.ReactElement {
  if (!tab) {
    return <RecoveryEmptyState />;
  }
  switch (tab.kind) {
    case 'chat':
      return tab.conversationId ? <ChatView conversationId={tab.conversationId} /> : <RecoveryEmptyState />;
    case 'memory-stream':
      return <MemoryStream />;
    case 'settings':
      return <SettingsView />;
    default:
      return <RecoveryEmptyState />;
  }
}

const RecoveryEmptyState: React.FC = () => {
  const openTab = useAppStore((s) => s.openTab);
  const createConversation = useChatStore((s) => s.createConversation);
  const [working, setWorking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    setWorking(true);
    try {
      const conv = await createConversation();
      openTab({ kind: 'chat', title: conv.title || 'New chat', conversationId: conv.id });
    } catch (err) {
      console.error('[AppShell] createConversation failed, falling back to local tab:', err);
      openTab({ kind: 'chat', title: 'New chat', conversationId: `local-${Date.now()}` });
      setError(err instanceof Error ? err.message : 'Could not reach the database.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-text-muted gap-4 px-6">
      <Brain size={36} className="text-text-muted/50" />
      <div className="text-center">
        <div className="text-text-primary text-base font-medium">Nothing open yet.</div>
        <div className="text-text-secondary text-[13px] mt-1">Start a new chat or open the Memory Stream.</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleStart}
          disabled={working}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-accent text-white hover:bg-accent-hover disabled:opacity-60"
        >
          <Plus size={14} /> {working ? 'Starting…' : 'Start a new chat'}
        </button>
        <button
          onClick={() => openTab({ kind: 'memory-stream', title: 'Memory Stream' })}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-border bg-surface-card text-text-primary hover:bg-surface-elevated"
        >
          <Brain size={14} /> Open Memory Stream
        </button>
      </div>
      {error ? (
        <div className="max-w-md text-center text-[12px] text-error bg-[var(--error-bg)] border border-error/30 rounded-md px-3 py-2">
          {error}
        </div>
      ) : null}
    </div>
  );
};

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
