import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import { listMemories, searchMemories } from '../memory/search';
import { deleteMemory, clearAllMemories, getStats, saveMemory } from '../memory/engine';
import { getDatabase } from '../database';
import type { Memory, MemoryFilters } from '../../shared/types';

function exportToFile(format: 'json' | 'markdown' | 'plain', memories: Memory[], destPath: string): void {
  if (format === 'json') {
    fs.writeFileSync(destPath, JSON.stringify(memories, null, 2), 'utf-8');
    return;
  }
  if (format === 'markdown') {
    const lines: string[] = ['# Memora Lumina — Memory Export', ''];
    for (const m of memories) {
      lines.push(`## ${m.summary}`);
      lines.push(`- **Layer:** ${m.layer}`);
      lines.push(`- **Importance:** ${m.importance}/10`);
      lines.push(`- **Created:** ${m.created_at}`);
      if (m.tags.length) lines.push(`- **Tags:** ${m.tags.join(', ')}`);
      lines.push('');
      lines.push(m.content);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
    fs.writeFileSync(destPath, lines.join('\n'), 'utf-8');
    return;
  }
  const plain = memories
    .map((m) => `[${m.layer} | imp ${m.importance} | ${m.created_at}]\n${m.summary}\n${m.content}\nTags: ${m.tags.join(', ')}`)
    .join('\n\n---\n\n');
  fs.writeFileSync(destPath, plain, 'utf-8');
}

export function registerMemoryHandlers(getWindow: () => BrowserWindow | null): void {
  ipcMain.handle('memory:getAll', (_event, filters: MemoryFilters) => listMemories(filters || {}));
  ipcMain.handle('memory:search', (_event, query: string, filters: MemoryFilters) => searchMemories(query, filters || {}));
  ipcMain.handle('memory:delete', (_event, id: string) => deleteMemory(id));
  ipcMain.handle('memory:stats', () => getStats());
  ipcMain.handle('memory:clearAll', () => clearAllMemories());

  ipcMain.handle('memory:export', async (_event, format: 'json' | 'markdown' | 'plain') => {
    const win = getWindow();
    if (!win) return null;
    const ext = format === 'markdown' ? 'md' : format === 'plain' ? 'txt' : 'json';
    const result = await dialog.showSaveDialog(win, {
      title: 'Export Memories',
      defaultPath: `memora-export-${Date.now()}.${ext}`,
      filters: [{ name: format.toUpperCase(), extensions: [ext] }],
    });
    if (result.canceled || !result.filePath) return null;
    const memories = listMemories({});
    exportToFile(format, memories, result.filePath);
    return { path: result.filePath };
  });

  ipcMain.handle('memory:import', async () => {
    const win = getWindow();
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, {
      title: 'Import Memory Backup',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const raw = fs.readFileSync(result.filePaths[0], 'utf-8');
    let parsed: Memory[] = [];
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('Invalid backup file.');
    }
    let imported = 0;
    for (const m of parsed) {
      if (!m.summary || !m.content || !m.layer) continue;
      saveMemory({
        layer: m.layer,
        content: m.content,
        summary: m.summary,
        importance: m.importance || 5,
        tags: Array.isArray(m.tags) ? m.tags : [],
        sourceConversationId: null,
        sourceMessageId: null,
        emotionalContext: m.emotional_context || null,
      });
      imported++;
    }
    return { imported };
  });

  ipcMain.handle('memory:injectToContext', (_event, _conversationId: string, memoryId: string) => {
    const db = getDatabase();
    db.prepare('UPDATE memories SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE id = ?').run(memoryId);
  });
}
