import React from 'react';
import { MessageSquare, Brain, Settings as SettingsIcon, X, Plus, SplitSquareHorizontal } from 'lucide-react';
import { useAppStore } from '@renderer/stores/useAppStore';
import { useChatStore } from '@renderer/stores/useChatStore';
import { cn } from '@renderer/lib/utils';
import { Tooltip } from '@renderer/components/common/Tooltip';

function tabIcon(kind: 'chat' | 'memory-stream' | 'settings') {
  switch (kind) {
    case 'chat':
      return <MessageSquare size={13} />;
    case 'memory-stream':
      return <Brain size={13} />;
    case 'settings':
      return <SettingsIcon size={13} />;
  }
}

export const TabBar: React.FC = () => {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const rightTabId = useAppStore((s) => s.rightTabId);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const closeTab = useAppStore((s) => s.closeTab);
  const openTab = useAppStore((s) => s.openTab);
  const splitWithTab = useAppStore((s) => s.splitWithTab);
  const unsplit = useAppStore((s) => s.unsplit);
  const createConversation = useChatStore((s) => s.createConversation);

  const handleNewChat = async () => {
    const conv = await createConversation();
    openTab({ kind: 'chat', title: conv.title || 'New chat', conversationId: conv.id });
  };

  return (
    <div className="flex items-stretch overflow-x-auto no-drag w-full">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const isRight = tab.id === rightTabId;
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'group flex items-center gap-2 px-3 max-w-[180px] cursor-pointer border-r border-border-subtle transition-colors',
              isActive ? 'bg-bg-primary text-text-primary' : 'text-text-secondary hover:bg-surface-elevated',
              isRight && !isActive ? 'bg-surface-elevated' : '',
            )}
          >
            <span className="flex-shrink-0">{tabIcon(tab.kind)}</span>
            <span className="truncate text-[12.5px] flex-1">{tab.title}</span>
            <Tooltip label={isRight ? 'Unsplit' : 'Open in split view'}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isRight) unsplit();
                  else splitWithTab(tab.id);
                }}
                className={cn(
                  'opacity-0 group-hover:opacity-100 hover:text-accent transition-opacity flex-shrink-0',
                  isRight && 'opacity-100 text-accent',
                )}
                aria-label="Toggle split"
              >
                <SplitSquareHorizontal size={11} />
              </button>
            </Tooltip>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-error transition-opacity flex-shrink-0"
              aria-label="Close tab"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
      <button
        onClick={handleNewChat}
        className="flex items-center px-3 text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
        aria-label="New chat"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
