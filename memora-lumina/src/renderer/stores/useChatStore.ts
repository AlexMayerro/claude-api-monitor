import { create } from 'zustand';
import type { Conversation, Message } from '@shared/types';

interface StreamingState {
  conversationId: string;
  messageId: string;
  text: string;
  startedAt: number;
}

interface ChatState {
  conversations: Conversation[];
  messagesByConv: Record<string, Message[]>;
  streaming: StreamingState | null;
  errorByConv: Record<string, string | null>;
  manualContextMemoryIds: Record<string, string[]>;

  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  createConversation: () => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;

  sendMessage: (conversationId: string, content: string) => Promise<void>;
  stopStream: (conversationId: string) => Promise<void>;

  // internal stream updates
  onChunk: (conversationId: string, messageId: string, chunk: string) => void;
  onStreamEnd: (conversationId: string, messageId: string, fullText: string, injectedIds: string[]) => void;
  onStreamError: (conversationId: string, message: string) => void;
  clearError: (conversationId: string) => void;

  addManualContext: (conversationId: string, memoryId: string) => void;
  clearManualContext: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messagesByConv: {},
  streaming: null,
  errorByConv: {},
  manualContextMemoryIds: {},

  loadConversations: async () => {
    const conversations = await window.memora.getConversations();
    set({ conversations });
  },

  loadMessages: async (conversationId) => {
    const messages = await window.memora.getMessages(conversationId);
    set((state) => ({ messagesByConv: { ...state.messagesByConv, [conversationId]: messages } }));
  },

  createConversation: async () => {
    const conv = await window.memora.createConversation();
    set((state) => ({ conversations: [conv, ...state.conversations] }));
    return conv;
  },

  deleteConversation: async (id) => {
    await window.memora.deleteConversation(id);
    set((state) => {
      const { [id]: _omit, ...rest } = state.messagesByConv;
      return { conversations: state.conversations.filter((c) => c.id !== id), messagesByConv: rest };
    });
  },

  renameConversation: async (id, title) => {
    await window.memora.renameConversation(id, title);
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, title } : c)),
    }));
  },

  togglePin: async (id) => {
    await window.memora.togglePinConversation(id);
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, is_pinned: c.is_pinned ? 0 : 1 } : c)),
    }));
  },

  sendMessage: async (conversationId, content) => {
    const manualIds = get().manualContextMemoryIds[conversationId] || [];
    set((state) => ({ errorByConv: { ...state.errorByConv, [conversationId]: null } }));
    try {
      // Optimistically add the user message client-side
      const tempUserMsg: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
        tokens_used: 0,
      };
      set((state) => ({
        messagesByConv: {
          ...state.messagesByConv,
          [conversationId]: [...(state.messagesByConv[conversationId] || []), tempUserMsg],
        },
      }));
      const { messageId } = await window.memora.sendMessage({
        conversationId,
        message: content,
        manualContextMemoryIds: manualIds,
      });
      set({
        streaming: { conversationId, messageId, text: '', startedAt: Date.now() },
      });
      // Clear manual context after send
      set((state) => ({ manualContextMemoryIds: { ...state.manualContextMemoryIds, [conversationId]: [] } }));
    } catch (err) {
      set((state) => ({ errorByConv: { ...state.errorByConv, [conversationId]: (err as Error).message } }));
    }
  },

  stopStream: async (conversationId) => {
    await window.memora.stopStream(conversationId);
  },

  onChunk: (conversationId, messageId, chunk) => {
    set((state) => {
      if (!state.streaming || state.streaming.conversationId !== conversationId || state.streaming.messageId !== messageId) {
        return { streaming: { conversationId, messageId, text: chunk, startedAt: Date.now() } };
      }
      return { streaming: { ...state.streaming, text: state.streaming.text + chunk } };
    });
  },

  onStreamEnd: (conversationId, messageId, fullText, injectedIds) => {
    // Reload messages to get the canonical record + refresh conversation list ordering
    set((state) => {
      const existing = state.messagesByConv[conversationId] || [];
      const finalMsg: Message = {
        id: messageId,
        conversation_id: conversationId,
        role: 'assistant',
        content: fullText,
        created_at: new Date().toISOString(),
        tokens_used: 0,
        injected_memory_ids: injectedIds,
      };
      const replaced = existing.some((m) => m.id === messageId)
        ? existing.map((m) => (m.id === messageId ? finalMsg : m))
        : [...existing, finalMsg];
      return {
        streaming: null,
        messagesByConv: { ...state.messagesByConv, [conversationId]: replaced },
      };
    });
    void get().loadConversations();
    void get().loadMessages(conversationId);
  },

  onStreamError: (conversationId, message) => {
    set((state) => ({
      streaming: null,
      errorByConv: { ...state.errorByConv, [conversationId]: message },
    }));
  },

  clearError: (conversationId) => {
    set((state) => ({ errorByConv: { ...state.errorByConv, [conversationId]: null } }));
  },

  addManualContext: (conversationId, memoryId) => {
    set((state) => {
      const existing = state.manualContextMemoryIds[conversationId] || [];
      if (existing.includes(memoryId)) return state;
      return {
        manualContextMemoryIds: {
          ...state.manualContextMemoryIds,
          [conversationId]: [...existing, memoryId],
        },
      };
    });
  },

  clearManualContext: (conversationId) => {
    set((state) => ({ manualContextMemoryIds: { ...state.manualContextMemoryIds, [conversationId]: [] } }));
  },
}));
