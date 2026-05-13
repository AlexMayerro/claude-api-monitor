import { ipcMain, BrowserWindow } from 'electron';
import { randomUUID } from 'crypto';
import { getDatabase } from '../database';
import { anthropicProvider } from '../llm/anthropic';
import { buildContextInjection } from '../memory/injector';
import { extractMemoriesFromConversation } from '../memory/engine';
import { getSetting } from './settings';
import { MAX_TOKENS_MAP, type Conversation, type Message, type SendMessageRequest } from '../../shared/types';

const activeStreams = new Map<string, AbortController>();

function rowToConversation(row: any): Conversation {
  return {
    id: row.id,
    title: row.title,
    created_at: row.created_at,
    updated_at: row.updated_at,
    is_pinned: row.is_pinned,
  };
}

function rowToMessage(row: any): Message {
  let injected: string[] = [];
  try {
    injected = row.injected_memory_ids ? JSON.parse(row.injected_memory_ids) : [];
  } catch {
    injected = [];
  }
  return {
    id: row.id,
    conversation_id: row.conversation_id,
    role: row.role,
    content: row.content,
    created_at: row.created_at,
    tokens_used: row.tokens_used || 0,
    injected_memory_ids: injected,
  };
}

function getConversation(id: string): Conversation | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as any;
  return row ? rowToConversation(row) : null;
}

function listConversations(): Conversation[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM conversations ORDER BY is_pinned DESC, updated_at DESC').all() as any[];
  return rows.map(rowToConversation);
}

function listMessages(conversationId: string): Message[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, rowid ASC').all(conversationId) as any[];
  return rows.map(rowToMessage);
}

function createConversation(): Conversation {
  const db = getDatabase();
  const id = randomUUID();
  db.prepare('INSERT INTO conversations (id, title) VALUES (?, ?)').run(id, 'New chat');
  return getConversation(id)!;
}

function renameConversation(id: string, title: string): void {
  const db = getDatabase();
  db.prepare('UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title.slice(0, 120), id);
}

function togglePin(id: string): void {
  const db = getDatabase();
  db.prepare('UPDATE conversations SET is_pinned = CASE is_pinned WHEN 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
}

function deleteConversation(id: string): void {
  const db = getDatabase();
  db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
}

function insertMessage(input: {
  id?: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed?: number;
  injectedMemoryIds?: string[];
}): Message {
  const db = getDatabase();
  const id = input.id ?? randomUUID();
  db.prepare(
    `INSERT INTO messages (id, conversation_id, role, content, tokens_used, injected_memory_ids) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, input.conversationId, input.role, input.content, input.tokensUsed ?? 0, JSON.stringify(input.injectedMemoryIds ?? []));
  db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(input.conversationId);
  const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as any;
  return rowToMessage(row);
}

function autoTitleConversation(conversationId: string, firstUserMessage: string): void {
  const db = getDatabase();
  const existing = db.prepare('SELECT title FROM conversations WHERE id = ?').get(conversationId) as { title: string } | undefined;
  if (!existing || (existing.title && existing.title !== 'New chat')) return;
  const title = firstUserMessage.replace(/\s+/g, ' ').trim().slice(0, 50);
  if (title) db.prepare('UPDATE conversations SET title = ? WHERE id = ?').run(title, conversationId);
}

async function sendMessageStreaming(window: BrowserWindow, req: SendMessageRequest): Promise<{ messageId: string }> {
  const settings = {
    apiKey: getSetting('api_key'),
    model: getSetting('default_model'),
    temperature: getSetting('temperature'),
    maxResponseLength: getSetting('max_response_length'),
    streaming: getSetting('streaming'),
    contextInjection: getSetting('context_injection'),
    maxInjectedMemories: getSetting('max_injected_memories'),
    maxInjectionTokens: getSetting('max_injection_tokens'),
    customSystemPrompt: getSetting('custom_system_prompt'),
    autoCapture: getSetting('auto_capture_memories'),
    importanceThreshold: getSetting('importance_threshold'),
  };
  if (!settings.apiKey) throw new Error('No API key configured.');

  // Save user message
  const userMessage = insertMessage({
    conversationId: req.conversationId,
    role: 'user',
    content: req.message,
  });
  autoTitleConversation(req.conversationId, req.message);

  // Build injection
  const injection = buildContextInjection(req.message, {
    enabled: settings.contextInjection,
    maxMemories: settings.maxInjectedMemories,
    maxTokens: settings.maxInjectionTokens,
    customSystemPrompt: settings.customSystemPrompt,
    manualMemoryIds: req.manualContextMemoryIds,
  });

  // Load conversation history (excluding the just-saved user message we'll send separately)
  const history = listMessages(req.conversationId);
  const messagesForAPI: Array<{ role: 'user' | 'assistant'; content: string }> = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const assistantMessageId = randomUUID();
  const controller = new AbortController();
  activeStreams.set(req.conversationId, controller);

  let fullText = '';
  const maxTokens = MAX_TOKENS_MAP[settings.maxResponseLength];

  if (settings.streaming) {
    await anthropicProvider.streamChat({
      apiKey: settings.apiKey,
      model: settings.model,
      system: injection.systemBlock,
      messages: messagesForAPI,
      temperature: settings.temperature,
      maxTokens,
      abortSignal: controller.signal,
      handlers: {
        onChunk: (chunk) => {
          fullText += chunk;
          if (!window.isDestroyed()) {
            window.webContents.send('chat:streamChunk', { conversationId: req.conversationId, messageId: assistantMessageId, chunk });
          }
        },
        onEnd: (text, tokensUsed) => {
          fullText = text;
          finalizeAssistantMessage(window, req.conversationId, assistantMessageId, fullText, tokensUsed, injection.injectedIds, settings, userMessage);
        },
        onError: (err) => {
          activeStreams.delete(req.conversationId);
          if (!window.isDestroyed()) {
            window.webContents.send('chat:streamError', { conversationId: req.conversationId, message: err.message });
          }
        },
      },
    });
  } else {
    try {
      fullText = await anthropicProvider.completeOnce({
        apiKey: settings.apiKey,
        model: settings.model,
        system: injection.systemBlock,
        messages: messagesForAPI,
        temperature: settings.temperature,
        maxTokens,
        abortSignal: controller.signal,
      });
      if (!window.isDestroyed()) {
        window.webContents.send('chat:streamChunk', { conversationId: req.conversationId, messageId: assistantMessageId, chunk: fullText });
      }
      finalizeAssistantMessage(window, req.conversationId, assistantMessageId, fullText, 0, injection.injectedIds, settings, userMessage);
    } catch (err) {
      activeStreams.delete(req.conversationId);
      if (!window.isDestroyed()) {
        window.webContents.send('chat:streamError', { conversationId: req.conversationId, message: (err as Error).message });
      }
    }
  }

  return { messageId: assistantMessageId };
}

function finalizeAssistantMessage(
  window: BrowserWindow,
  conversationId: string,
  assistantMessageId: string,
  fullText: string,
  tokensUsed: number,
  injectedIds: string[],
  settings: { apiKey: string; autoCapture: boolean; importanceThreshold: number },
  userMessage: Message,
) {
  insertMessage({
    id: assistantMessageId,
    conversationId,
    role: 'assistant',
    content: fullText,
    tokensUsed,
    injectedMemoryIds: injectedIds,
  });
  activeStreams.delete(conversationId);
  if (!window.isDestroyed()) {
    window.webContents.send('chat:streamEnd', { conversationId, messageId: assistantMessageId, fullText, injectedMemoryIds: injectedIds });
  }

  if (settings.autoCapture && fullText.trim()) {
    extractMemoriesFromConversation({
      apiKey: settings.apiKey,
      conversationId,
      assistantMessageId,
      recentMessages: [
        { role: 'user', content: userMessage.content },
        { role: 'assistant', content: fullText },
      ],
      importanceThreshold: settings.importanceThreshold,
    })
      .then((memories) => {
        if (window.isDestroyed()) return;
        for (const m of memories) window.webContents.send('memory:saved', m);
      })
      .catch(() => {});
  }
}

export function registerChatHandlers(getWindow: () => BrowserWindow | null): void {
  ipcMain.handle('chat:send', async (_event, req: SendMessageRequest) => {
    const win = getWindow();
    if (!win) throw new Error('No window available.');
    return sendMessageStreaming(win, req);
  });
  ipcMain.handle('chat:stop', async (_event, conversationId: string) => {
    const controller = activeStreams.get(conversationId);
    if (controller) controller.abort();
  });
  ipcMain.handle('chat:getConversations', () => listConversations());
  ipcMain.handle('chat:getMessages', (_event, conversationId: string) => listMessages(conversationId));
  ipcMain.handle('chat:createConversation', () => createConversation());
  ipcMain.handle('chat:renameConversation', (_event, id: string, title: string) => renameConversation(id, title));
  ipcMain.handle('chat:togglePinConversation', (_event, id: string) => togglePin(id));
  ipcMain.handle('chat:deleteConversation', (_event, id: string) => deleteConversation(id));
}
