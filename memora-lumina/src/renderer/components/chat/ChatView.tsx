import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChatStore } from '@renderer/stores/useChatStore';
import { useMemoryStore } from '@renderer/stores/useMemoryStore';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { extractKeywords } from '@renderer/lib/utils';

interface Props {
  conversationId: string;
}

export const ChatView: React.FC<Props> = ({ conversationId }) => {
  const messages = useChatStore((s) => s.messagesByConv[conversationId] || []);
  const loadMessages = useChatStore((s) => s.loadMessages);
  const error = useChatStore((s) => s.errorByConv[conversationId]);
  const clearError = useChatStore((s) => s.clearError);
  const streaming = useChatStore((s) => s.streaming);

  const memories = useMemoryStore((s) => s.memories);
  const loadMemories = useMemoryStore((s) => s.loadMemories);
  const triggerAutoJump = useMemoryStore((s) => s.triggerAutoJump);
  const autoJumpSensitivity = useSettingsStore((s) => s.settings.auto_jump_sensitivity);

  useEffect(() => {
    loadMessages(conversationId);
    if (memories.length === 0) loadMemories();
  }, [conversationId, loadMessages, loadMemories, memories.length]);

  // Auto-jump: based on the latest user/assistant text, search for keyword matches in memories.
  useEffect(() => {
    if (autoJumpSensitivity === 'off') return;
    const sourceText = streaming?.conversationId === conversationId && streaming?.text
      ? streaming.text
      : messages.length > 0
      ? messages[messages.length - 1].content
      : '';
    if (!sourceText) return;
    const keywords = extractKeywords(sourceText, 4, 5);
    if (keywords.length === 0) return;
    const required = autoJumpSensitivity === 'high' ? 1 : autoJumpSensitivity === 'medium' ? 2 : 3;
    let bestId: string | null = null;
    let bestScore = 0;
    for (const m of memories) {
      const haystack = `${m.summary} ${m.content} ${m.tags.join(' ')}`.toLowerCase();
      let score = 0;
      for (const k of keywords) if (haystack.includes(k)) score++;
      if (score >= required && score > bestScore) {
        bestScore = score;
        bestId = m.id;
      }
    }
    if (bestId) triggerAutoJump(bestId);
  }, [streaming?.text, streaming?.conversationId, conversationId, messages, memories, autoJumpSensitivity, triggerAutoJump]);

  return (
    <div className="h-full flex flex-col bg-bg-primary">
      {error ? (
        <div className="px-6 py-3 bg-[var(--error-bg)] border-b border-error/30 flex items-start gap-2 text-error text-[13px]">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => clearError(conversationId)} className="text-error/70 hover:text-error" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ) : null}
      <MessageList conversationId={conversationId} messages={messages} />
      <ChatInput conversationId={conversationId} />
    </div>
  );
};
