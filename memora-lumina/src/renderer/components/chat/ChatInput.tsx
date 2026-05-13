import React, { useEffect, useRef, useState } from 'react';
import { Send, Square, X } from 'lucide-react';
import { useChatStore } from '@renderer/stores/useChatStore';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { useMemoryStore } from '@renderer/stores/useMemoryStore';
import { cn } from '@renderer/lib/utils';

interface Props {
  conversationId: string;
}

export const ChatInput: React.FC<Props> = ({ conversationId }) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const stopStream = useChatStore((s) => s.stopStream);
  const streaming = useChatStore((s) => s.streaming);
  const manualIds = useChatStore((s) => s.manualContextMemoryIds[conversationId] || []);
  const clearManual = useChatStore((s) => s.clearManualContext);
  const sendShortcut = useSettingsStore((s) => s.settings.send_shortcut);
  const memories = useMemoryStore((s) => s.memories);

  const isStreaming = streaming?.conversationId === conversationId;

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleSend = async () => {
    const text = value.trim();
    if (!text || isStreaming) return;
    setValue('');
    await sendMessage(conversationId, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (sendShortcut === 'enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      } else if (sendShortcut === 'ctrl_enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const manualMemories = manualIds.map((id) => memories.find((m) => m.id === id)).filter(Boolean);

  return (
    <div className="border-t border-border-subtle bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 py-4">
        {manualMemories.length > 0 ? (
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-text-muted uppercase tracking-wide font-semibold">Context attached:</span>
            {manualMemories.map((m) => (
              <span key={m!.id} className="inline-flex items-center gap-1 bg-accent-subtle text-accent px-2 py-0.5 rounded text-[11.5px]">
                {m!.summary.slice(0, 40)}…
              </span>
            ))}
            <button onClick={() => clearManual(conversationId)} className="text-text-muted hover:text-text-primary" aria-label="Clear">
              <X size={12} />
            </button>
          </div>
        ) : null}
        <div className="flex items-end gap-2 rounded-lg border border-border bg-surface-card focus-within:border-accent transition-colors px-3 py-2">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message Claude…"
            className="flex-1 min-h-[24px] max-h-40 resize-none outline-none bg-transparent text-text-primary placeholder:text-text-muted py-1"
          />
          {isStreaming ? (
            <button
              onClick={() => stopStream(conversationId)}
              className="w-9 h-9 inline-flex items-center justify-center rounded-md bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-active border border-border"
              aria-label="Stop"
            >
              <Square size={14} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!value.trim()}
              className={cn(
                'w-9 h-9 inline-flex items-center justify-center rounded-md transition-colors',
                value.trim() ? 'bg-accent hover:bg-accent-hover text-white' : 'bg-surface-elevated text-text-muted cursor-not-allowed',
              )}
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10.5px] text-text-muted">
            {sendShortcut === 'enter' ? 'Enter to send · Shift+Enter for newline' : 'Ctrl+Enter to send'}
          </span>
          {value.length > 1000 ? (
            <span className="text-[10.5px] text-text-muted tabular-nums">{value.length} chars</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
