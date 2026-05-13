import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Memory } from '@shared/types';
import { Badge } from '@renderer/components/common/Badge';
import { Tooltip } from '@renderer/components/common/Tooltip';
import { MemoryDot } from './MemoryDot';
import { HighlightText } from './HighlightText';
import { useChatStore } from '@renderer/stores/useChatStore';
import { useAppStore } from '@renderer/stores/useAppStore';
import { useMemoryStore } from '@renderer/stores/useMemoryStore';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { LAYER_LABEL } from '@renderer/lib/constants';
import { relativeTime } from '@renderer/lib/utils';

interface Props {
  memory: Memory;
  query: string;
}

export const StreamEntry: React.FC<Props> = ({ memory, query }) => {
  const showDots = useSettingsStore((s) => s.settings.show_importance_dots);
  const showBadge = useSettingsStore((s) => s.settings.show_layer_badges);
  const streamFont = useSettingsStore((s) => s.settings.stream_font_size);
  const addManual = useChatStore((s) => s.addManualContext);
  const showToast = useAppStore((s) => s.showToast);
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const rightTabId = useAppStore((s) => s.rightTabId);
  const autoJumpTargetId = useMemoryStore((s) => s.autoJumpTargetId);
  const clearAutoJump = useMemoryStore((s) => s.clearAutoJump);
  const deleteMemory = useMemoryStore((s) => s.deleteMemory);
  const ref = useRef<HTMLDivElement>(null);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (autoJumpTargetId === memory.id && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setPulsing(true);
      const t = setTimeout(() => {
        setPulsing(false);
        clearAutoJump();
      }, 1600);
      return () => clearTimeout(t);
    }
  }, [autoJumpTargetId, memory.id, clearAutoJump]);

  const handleInject = () => {
    const activeChat = tabs.find((t) => t.id === activeTabId && t.kind === 'chat');
    const rightChat = tabs.find((t) => t.id === rightTabId && t.kind === 'chat');
    const chatTab = activeChat || rightChat;
    if (!chatTab?.conversationId) {
      showToast('Open a chat first to inject this memory.', 3000);
      return;
    }
    addManual(chatTab.conversationId, memory.id);
    window.memora.injectMemoryToContext(chatTab.conversationId, memory.id);
    showToast('Memory added to context', 2000);
  };

  return (
    <div
      ref={ref}
      className={`group relative flex gap-3 px-4 py-3 border-b border-border-subtle hover:bg-surface-elevated transition-colors ${
        pulsing ? 'auto-jump-pulse rounded-md' : ''
      }`}
      style={{ fontSize: streamFont }}
    >
      {showDots ? <MemoryDot layer={memory.layer} importance={memory.importance} /> : null}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[11px] text-text-muted tabular-nums">{relativeTime(memory.created_at)}</span>
          {showBadge ? <Badge>{LAYER_LABEL[memory.layer]}</Badge> : null}
          <Badge variant={memory.importance >= 7 ? 'accent' : 'default'}>imp {memory.importance}/10</Badge>
          {memory.access_count > 0 ? (
            <span className="text-[10.5px] text-text-muted">used {memory.access_count}×</span>
          ) : null}
        </div>
        <div className="font-medium text-text-primary leading-snug">
          <HighlightText text={memory.summary} query={query} />
        </div>
        {memory.content && memory.content !== memory.summary ? (
          <div className="mt-1 text-text-secondary leading-relaxed">
            <HighlightText text={memory.content} query={query} />
          </div>
        ) : null}
        {memory.tags.length > 0 ? (
          <div className="mt-1.5 flex gap-1 flex-wrap">
            {memory.tags.map((t) => (
              <span key={t} className="text-[10.5px] px-1.5 py-0.5 rounded bg-surface-active text-text-secondary">
                #{t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip label="Add to chat context" side="left">
          <button
            onClick={handleInject}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-accent hover:bg-surface-card"
            aria-label="Inject to context"
          >
            <Plus size={14} />
          </button>
        </Tooltip>
        <Tooltip label="Delete memory" side="left">
          <button
            onClick={() => deleteMemory(memory.id)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-error hover:bg-surface-card"
            aria-label="Delete memory"
          >
            <Trash2 size={13} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
