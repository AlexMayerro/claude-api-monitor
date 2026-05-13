import { ipcMain, BrowserWindow, shell, app } from 'electron';
import { getDatabase } from '../database';
import { anthropicProvider } from '../llm/anthropic';
import { saveMemory } from '../memory/engine';
import { registerChatHandlers } from './chat';
import { registerMemoryHandlers } from './memory';
import { registerSettingsHandlers } from './settings';
import type { UserProfile } from '../../shared/types';

function registerProfileHandlers(): void {
  ipcMain.handle('profile:get', () => {
    const db = getDatabase();
    const row = db.prepare('SELECT name, primary_use, initial_context, created_at FROM user_profile WHERE id = 1').get() as
      | UserProfile
      | undefined;
    return row || null;
  });
  ipcMain.handle('profile:update', (_event, data: Partial<UserProfile>) => {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM user_profile WHERE id = 1').get() as any;
    if (existing) {
      db.prepare(
        `UPDATE user_profile SET
           name = COALESCE(?, name),
           primary_use = COALESCE(?, primary_use),
           initial_context = COALESCE(?, initial_context)
         WHERE id = 1`,
      ).run(data.name ?? null, data.primary_use ?? null, data.initial_context ?? null);
    } else {
      db.prepare(`INSERT INTO user_profile (id, name, primary_use, initial_context) VALUES (1, ?, ?, ?)`).run(
        data.name || 'Friend',
        data.primary_use || '',
        data.initial_context || '',
      );
      // Seed core identity memory
      const summary = `User's name is ${data.name || 'Friend'}.`;
      const contentParts: string[] = [summary];
      if (data.primary_use) contentParts.push(`Primary use case: ${data.primary_use}.`);
      if (data.initial_context) contentParts.push(`Initial context provided: ${data.initial_context}`);
      saveMemory({
        layer: 'core_identity',
        content: contentParts.join(' '),
        summary,
        importance: 10,
        tags: ['identity', 'profile'],
        sourceConversationId: null,
        sourceMessageId: null,
        emotionalContext: null,
      });
      if (data.initial_context && data.initial_context.trim()) {
        saveMemory({
          layer: 'core_identity',
          content: data.initial_context.trim(),
          summary: data.initial_context.trim().slice(0, 140),
          importance: 9,
          tags: ['initial-context'],
          sourceConversationId: null,
          sourceMessageId: null,
          emotionalContext: null,
        });
      }
    }
  });
}

function registerAuthHandlers(): void {
  ipcMain.handle('auth:validateApiKey', async (_event, apiKey: string) => {
    return anthropicProvider.validateKey(apiKey);
  });
}

function registerWindowHandlers(getWindow: () => BrowserWindow | null): void {
  ipcMain.on('window:minimize', () => getWindow()?.minimize());
  ipcMain.on('window:maximize', () => {
    const w = getWindow();
    if (!w) return;
    if (w.isMaximized()) w.unmaximize();
    else w.maximize();
  });
  ipcMain.on('window:close', () => getWindow()?.close());
  ipcMain.handle('window:isMaximized', () => !!getWindow()?.isMaximized());
  ipcMain.on('window:openExternal', (_event, url: string) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
  });
  ipcMain.handle('app:getVersion', () => app.getVersion());
}

export function registerAllHandlers(getWindow: () => BrowserWindow | null): void {
  registerSettingsHandlers();
  registerChatHandlers(getWindow);
  registerMemoryHandlers(getWindow);
  registerProfileHandlers();
  registerAuthHandlers();
  registerWindowHandlers(getWindow);
}
