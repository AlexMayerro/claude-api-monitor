import { useEffect } from 'react';
import { useChatStore } from '@renderer/stores/useChatStore';
import { useMemoryStore } from '@renderer/stores/useMemoryStore';
import { useAppStore } from '@renderer/stores/useAppStore';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';

export function useIPCListeners(): void {
  const onChunk = useChatStore((s) => s.onChunk);
  const onStreamEnd = useChatStore((s) => s.onStreamEnd);
  const onStreamError = useChatStore((s) => s.onStreamError);
  const appendMemory = useMemoryStore((s) => s.appendMemory);
  const showToast = useAppStore((s) => s.showToast);
  const memorySavedToast = useSettingsStore((s) => s.settings.memory_saved_toast);

  useEffect(() => {
    const offChunk = window.memora.onStreamChunk((evt) => {
      onChunk(evt.conversationId, evt.messageId, evt.chunk);
    });
    const offEnd = window.memora.onStreamEnd((evt) => {
      onStreamEnd(evt.conversationId, evt.messageId, evt.fullText, evt.injectedMemoryIds);
    });
    const offError = window.memora.onStreamError((evt) => {
      onStreamError(evt.conversationId, evt.message);
    });
    const offMemory = window.memora.onMemorySaved((memory) => {
      appendMemory(memory);
      if (memorySavedToast) showToast(`New memory saved: ${memory.summary}`, 3000);
    });
    return () => {
      offChunk();
      offEnd();
      offError();
      offMemory();
    };
  }, [onChunk, onStreamEnd, onStreamError, appendMemory, showToast, memorySavedToast]);
}
