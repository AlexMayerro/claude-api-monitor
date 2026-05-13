import { getDatabase } from '../database';
import { rankMemoriesForInjection, bumpAccess } from './search';
import { getCoreIdentityMemories } from './layers';
import type { Memory } from '../../shared/types';

const APPROX_CHARS_PER_TOKEN = 4;

export interface InjectionResult {
  systemBlock: string;
  injectedIds: string[];
}

function extractKeywords(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 32)
    .join(' ');
}

function getProfileSummary(): string {
  const db = getDatabase();
  const row = db.prepare('SELECT name, primary_use, initial_context FROM user_profile WHERE id = 1').get() as
    | { name: string; primary_use: string | null; initial_context: string | null }
    | undefined;
  if (!row) return '';
  const parts: string[] = [`The user's name is ${row.name}.`];
  if (row.primary_use) parts.push(`They primarily use this assistant for ${row.primary_use.toLowerCase()}.`);
  if (row.initial_context) parts.push(row.initial_context);
  return parts.join(' ');
}

export function buildContextInjection(
  userMessage: string,
  options: {
    enabled: boolean;
    maxMemories: number;
    maxTokens: number;
    customSystemPrompt: string;
    manualMemoryIds?: string[];
  },
): InjectionResult {
  const sections: string[] = [];
  if (options.customSystemPrompt && options.customSystemPrompt.trim()) {
    sections.push(options.customSystemPrompt.trim());
  }

  sections.push(
    'You are Claude, integrated into Memora Lumina — a personal memory layer. You have access to important context about the user from past conversations. Use it naturally when relevant; never mention the memory system explicitly unless the user asks about it. Refer to the user by name when natural. Be warm, accurate, and concise.',
  );

  const profile = getProfileSummary();
  if (profile) sections.push(`About the user: ${profile}`);

  const injectedIds: string[] = [];

  if (!options.enabled) {
    return { systemBlock: sections.join('\n\n'), injectedIds };
  }

  const core = getCoreIdentityMemories();
  const coreSummaries = core.map((m) => m.summary);
  if (coreSummaries.length) {
    sections.push(`Core identity:\n${coreSummaries.map((s) => `- ${s}`).join('\n')}`);
    injectedIds.push(...core.map((m) => m.id));
  }

  const keywords = extractKeywords(userMessage);
  const ranked = keywords ? rankMemoriesForInjection(keywords, ['long_term', 'mid_term', 'short_term'], options.maxMemories) : [];

  const manualMemories: Memory[] = [];
  if (options.manualMemoryIds && options.manualMemoryIds.length) {
    const db = getDatabase();
    const placeholders = options.manualMemoryIds.map(() => '?').join(',');
    const rows = db.prepare(`SELECT * FROM memories WHERE id IN (${placeholders}) AND is_active = 1`).all(...options.manualMemoryIds) as any[];
    for (const r of rows) {
      manualMemories.push({
        id: r.id,
        layer: r.layer,
        content: r.content,
        summary: r.summary,
        importance: r.importance,
        tags: [],
        source_conversation_id: r.source_conversation_id,
        source_message_id: r.source_message_id,
        emotional_context: r.emotional_context,
        created_at: r.created_at,
        last_accessed: r.last_accessed,
        access_count: r.access_count,
        is_active: r.is_active,
      });
    }
  }

  const combined = [...manualMemories, ...ranked].filter(
    (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i && !injectedIds.includes(m.id),
  );

  const memoryLines: string[] = [];
  const budget = options.maxTokens * APPROX_CHARS_PER_TOKEN;
  let used = sections.join('\n\n').length;
  for (const m of combined) {
    const line = `- ${m.summary}`;
    if (used + line.length > budget) break;
    memoryLines.push(line);
    injectedIds.push(m.id);
    used += line.length + 1;
  }

  if (memoryLines.length) {
    sections.push(`Relevant memories:\n${memoryLines.join('\n')}`);
  }

  if (injectedIds.length) bumpAccess(injectedIds);
  return { systemBlock: sections.join('\n\n'), injectedIds };
}
