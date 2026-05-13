import React, { useEffect, useState } from 'react';
import { Plus, Brain, Settings as SettingsIcon, Trash2, Pin, Pencil, ChevronsLeft, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@renderer/stores/useAppStore';
import { useChatStore } from '@renderer/stores/useChatStore';
import { useMemoryStore } from '@renderer/stores/useMemoryStore';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { groupByDate, cn } from '@renderer/lib/utils';
import { Tooltip } from '@renderer/components/common/Tooltip';
import { Modal } from '@renderer/components/common/Modal';
import { Button } from '@renderer/components/common/Button';

export const Sidebar: React.FC = () => {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const openTab = useAppStore((s) => s.openTab);
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);

  const conversations = useChatStore((s) => s.conversations);
  const loadConversations = useChatStore((s) => s.loadConversations);
  const createConversation = useChatStore((s) => s.createConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const renameConversation = useChatStore((s) => s.renameConversation);
  const togglePin = useChatStore((s) => s.togglePin);

  const stats = useMemoryStore((s) => s.stats);
  const loadStats = useMemoryStore((s) => s.loadStats);
  const memoryCountBadge = useSettingsStore((s) => s.settings.memory_count_badge);
  const sidebarWidth = useSettingsStore((s) => s.settings.sidebar_width);
  const sidebarPosition = useSettingsStore((s) => s.settings.sidebar_position);
  const profile = useSettingsStore((s) => s.settings); // unused but keeps live updates

  const [profileName, setProfileName] = useState<string>('You');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const showToast = useAppStore((s) => s.showToast);
  const closeTab = useAppStore((s) => s.closeTab);
  const tabsAll = useAppStore((s) => s.tabs);

  useEffect(() => {
    loadConversations();
    loadStats();
    window.memora.getProfile().then((p) => {
      if (p?.name) setProfileName(p.name);
    });
  }, [loadConversations, loadStats]);

  const activeConvId = tabs.find((t) => t.id === activeTabId)?.conversationId;
  const grouped = groupByDate(conversations);
  const pinned = conversations.filter((c) => c.is_pinned);

  const handleNewChat = async () => {
    const conv = await createConversation();
    openTab({ kind: 'chat', title: conv.title || 'New chat', conversationId: conv.id });
  };

  const handleOpenConv = (id: string, title: string) => {
    openTab({ kind: 'chat', title, conversationId: id });
  };

  const requestDelete = (id: string, title: string) => setPendingDelete({ id, title });

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, title } = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteConversation(id);
      // Close any open tabs for this conversation
      tabsAll.filter((t) => t.kind === 'chat' && t.conversationId === id).forEach((t) => closeTab(t.id));
      showToast(`Deleted "${title.slice(0, 40)}"`, { kind: 'success', durationMs: 2500 });
    } catch (err) {
      console.error('[Sidebar] deleteConversation failed:', err);
      showToast(`Could not delete conversation: ${(err as Error).message}`, { kind: 'error', durationMs: 4000 });
    }
  };

  if (!sidebarOpen) {
    return (
      <div className="flex flex-col items-center w-[44px] bg-bg-secondary border-r border-border-subtle py-3 gap-2">
        <Tooltip label="Expand sidebar" side="right">
          <button onClick={toggleSidebar} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-elevated text-text-secondary">
            <ChevronsLeft size={16} className="rotate-180" />
          </button>
        </Tooltip>
        <Tooltip label="New chat" side="right">
          <button onClick={handleNewChat} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-elevated text-text-secondary">
            <Plus size={16} />
          </button>
        </Tooltip>
        <Tooltip label="Memory Stream" side="right">
          <button
            onClick={() => openTab({ kind: 'memory-stream', title: 'Memory Stream' })}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-elevated text-text-secondary"
          >
            <Brain size={16} />
          </button>
        </Tooltip>
        <div className="mt-auto" />
        <Tooltip label="Settings" side="right">
          <button onClick={() => openTab({ kind: 'settings', title: 'Settings' })} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-elevated text-text-secondary">
            <SettingsIcon size={16} />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col bg-bg-secondary border-border-subtle flex-shrink-0', sidebarPosition === 'right' ? 'border-l' : 'border-r')}
      style={{ width: sidebarWidth }}
    >
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border-subtle">
        <div className="w-8 h-8 rounded-full bg-accent-subtle text-accent flex items-center justify-center text-[13px] font-semibold flex-shrink-0">
          {profileName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-text-primary truncate">{profileName}</div>
          <div className="text-[11px] text-text-muted">Memora Lumina</div>
        </div>
        <Tooltip label="Collapse sidebar" side="bottom">
          <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-surface-elevated text-text-muted">
            <ChevronsLeft size={14} />
          </button>
        </Tooltip>
      </div>
      <div className="px-3 py-3 border-b border-border-subtle">
        <button
          onClick={handleNewChat}
          className="w-full h-9 inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md font-medium text-[13px] transition-colors"
        >
          <Plus size={15} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {pinned.length > 0 && (
          <Section label="Pinned">
            {pinned.map((c) => (
              <ConvRow
                key={'pin-' + c.id}
                title={c.title}
                isActive={activeConvId === c.id}
                isPinned
                editing={editingId === c.id}
                editingValue={editingValue}
                onClick={() => handleOpenConv(c.id, c.title)}
                onStartEdit={() => { setEditingId(c.id); setEditingValue(c.title); }}
                onSubmitEdit={async () => {
                  await renameConversation(c.id, editingValue || c.title);
                  setEditingId(null);
                }}
                onChangeEdit={setEditingValue}
                onTogglePin={() => togglePin(c.id)}
                onDelete={() => requestDelete(c.id, c.title)}
              />
            ))}
          </Section>
        )}
        {grouped.map((g) => (
          <Section key={g.label} label={g.label}>
            {g.items
              .filter((c) => !c.is_pinned)
              .map((c) => (
                <ConvRow
                  key={c.id}
                  title={c.title}
                  isActive={activeConvId === c.id}
                  isPinned={!!c.is_pinned}
                  editing={editingId === c.id}
                  editingValue={editingValue}
                  onClick={() => handleOpenConv(c.id, c.title)}
                  onStartEdit={() => { setEditingId(c.id); setEditingValue(c.title); }}
                  onSubmitEdit={async () => {
                    await renameConversation(c.id, editingValue || c.title);
                    setEditingId(null);
                  }}
                  onChangeEdit={setEditingValue}
                  onTogglePin={() => togglePin(c.id)}
                  onDelete={() => deleteConversation(c.id)}
                />
              ))}
          </Section>
        ))}
        {conversations.length === 0 && (
          <div className="px-3 py-8 text-center text-text-muted text-[12px]">
            No conversations yet. Click <span className="text-text-secondary">New Chat</span> to start.
          </div>
        )}
      </div>

      <div className="border-t border-border-subtle px-2 py-2 flex items-center gap-1">
        <button
          onClick={() => openTab({ kind: 'memory-stream', title: 'Memory Stream' })}
          className="flex-1 inline-flex items-center justify-between gap-2 px-3 h-9 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-elevated text-[12.5px]"
        >
          <span className="inline-flex items-center gap-2">
            <Brain size={14} />
            Memory Stream
          </span>
          {memoryCountBadge && stats ? (
            <span className="text-[10.5px] tabular-nums text-accent bg-accent-subtle px-1.5 py-0.5 rounded">
              {stats.total}
            </span>
          ) : null}
        </button>
        <Tooltip label="Settings" side="top">
          <button
            onClick={() => openTab({ kind: 'settings', title: 'Settings' })}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
            aria-label="Settings"
          >
            <SettingsIcon size={14} />
          </button>
        </Tooltip>
      </div>

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete this conversation?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>
              <Trash2 size={14} /> Delete
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 text-[13.5px] text-text-secondary">
          <AlertTriangle size={20} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-text-primary">"{pendingDelete?.title}"</div>
            <div className="mt-1">All messages in this conversation will be permanently deleted. Your saved memories are not affected.</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-3">
    <div className="px-3 py-1 text-[10.5px] uppercase tracking-wide text-text-muted font-semibold">{label}</div>
    <div className="flex flex-col">{children}</div>
  </div>
);

interface ConvRowProps {
  title: string;
  isActive: boolean;
  isPinned: boolean;
  editing: boolean;
  editingValue: string;
  onClick: () => void;
  onStartEdit: () => void;
  onSubmitEdit: () => void;
  onChangeEdit: (v: string) => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

const ConvRow: React.FC<ConvRowProps> = (p) => {
  return (
    <div
      onClick={p.onClick}
      onDoubleClick={p.onStartEdit}
      className={cn(
        'group mx-1 flex items-center gap-2 px-2 h-8 rounded-md cursor-pointer transition-colors',
        p.isActive ? 'bg-accent-subtle text-text-primary' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
      )}
    >
      {p.editing ? (
        <input
          autoFocus
          value={p.editingValue}
          onChange={(e) => p.onChangeEdit(e.target.value)}
          onBlur={p.onSubmitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') p.onSubmitEdit();
            if (e.key === 'Escape') p.onSubmitEdit();
          }}
          className="flex-1 bg-surface-card border border-border rounded px-1.5 py-0.5 text-[12.5px] text-text-primary outline-none"
        />
      ) : (
        <span className="flex-1 truncate text-[12.5px]">{p.title}</span>
      )}
      <button onClick={(e) => { e.stopPropagation(); p.onStartEdit(); }} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary" aria-label="Rename">
        <Pencil size={11} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); p.onTogglePin(); }} className={cn('text-text-muted hover:text-accent', p.isPinned ? 'opacity-100 text-accent' : 'opacity-0 group-hover:opacity-100')} aria-label="Pin">
        <Pin size={11} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); p.onDelete(); }} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-error" aria-label="Delete">
        <Trash2 size={11} />
      </button>
    </div>
  );
};
