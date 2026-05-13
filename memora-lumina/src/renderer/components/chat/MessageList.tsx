import React, { useEffect, useRef } from 'react';
import type { Message } from '@shared/types';
import { MessageBubble } from './MessageBubble';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { useChatStore } from '@renderer/stores/useChatStore';

interface Props {
  conversationId: string;
  messages: Message[];
}

export const MessageList: React.FC<Props> = ({ conversationId, messages }) => {
  const density = useSettingsStore((s) => s.settings.message_density);
  const bubbleStyle = useSettingsStore((s) => s.settings.chat_bubble_style);
  const showTimestamps = useSettingsStore((s) => s.settings.show_timestamps);
  const autoScroll = useSettingsStore((s) => s.settings.auto_scroll);
  const streaming = useChatStore((s) => s.streaming);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, autoScroll]);

  useEffect(() => {
    if (autoScroll && bottomRef.current && streaming?.conversationId === conversationId) {
      bottomRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, [streaming?.text, streaming?.conversationId, conversationId, autoScroll]);

  const streamingMatch = streaming && streaming.conversationId === conversationId;
  const isLastMessageStreaming = streamingMatch && messages.length > 0 && messages[messages.length - 1].id === streaming.messageId;
  const streamingPreviewMessage: Message | null = streamingMatch && !isLastMessageStreaming
    ? {
        id: streaming.messageId,
        conversation_id: conversationId,
        role: 'assistant',
        content: streaming.text,
        created_at: new Date(streaming.startedAt).toISOString(),
        tokens_used: 0,
      }
    : null;

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4">
      <div className="max-w-3xl mx-auto">
        {messages.length === 0 && !streamingMatch ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 text-text-secondary">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-hover text-white flex items-center justify-center mb-4 shadow-elevated">
              <span className="text-2xl font-bold">M</span>
            </div>
            <div className="text-base font-medium text-text-primary mb-1">Start a new memory.</div>
            <div className="text-[13px]">Type a message — I'll remember what matters.</div>
          </div>
        ) : null}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            streaming={!!streamingMatch && m.id === streaming!.messageId}
            density={density}
            bubbleStyle={bubbleStyle}
            showTimestamp={showTimestamps}
          />
        ))}
        {streamingPreviewMessage ? (
          <MessageBubble
            message={streamingPreviewMessage}
            streaming
            density={density}
            bubbleStyle={bubbleStyle}
            showTimestamp={showTimestamps}
          />
        ) : null}
        {streamingMatch && !streamingPreviewMessage && (!streaming!.text || streaming!.text.length === 0) ? (
          <div className="flex justify-start py-3">
            <div className="bg-surface-card px-4 py-2.5 rounded-2xl border border-border-subtle text-text-secondary text-[13px] inline-flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              <span className="ml-1">Claude is thinking…</span>
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
