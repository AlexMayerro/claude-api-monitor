import { randomUUID } from 'crypto';
import { getDatabase } from '../database';
import { anthropicProvider } from '../llm/anthropic';
import type { Memory, MemoryLayer } from '../../shared/types';

const EXTRACTION_MODEL = 'claude-haiku-4-5-20251001';

const EXTRACTION_SYSTEM = `You analyze conversation excerpts and extract information worth remembering about the user — facts, preferences, decisions, goals, projects, emotional states, or anything useful to recall in future conversations.

For each extracted memory, return an object with:
- summary: a concise one-sentence summary (max ~140 chars)
- content: 2-3 sentence context
- importance: integer 1-10 (10 = critical life fact, 1 = trivial)
- layer: "core_identity" | "long_term" | "mid_term" | "short_term"
- tags: array of topic tags (lowercase, max 5)
- emotional_context: short string or null

Reply with ONLY a JSON array. If nothing is worth remembering, return [].
Be selective. Do NOT extract every sentence. Skip generic AI advice, code blocks, and trivia.`;

interface ExtractedMemory {
  summary: string;
  content: string;
  importance: number;
  layer: MemoryLayer;
  tags?: string[];
  emotional_context?: string | null;
}

function parseExtractionResponse(raw: string): ExtractedMemory[] {
  let text = raw.trim();
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) text = codeBlock[1].trim();
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket === -1 || lastBracket === -1) return [];
  try {
    const parsed = JSON.parse(text.slice(firstBracket, lastBracket + 1));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is ExtractedMemory => {
      return (
        p &&
        typeof p.summary === 'string' &&
        typeof p.content === 'string' &&
        typeof p.importance === 'number' &&
        typeof p.layer === 'string' &&
        ['core_identity', 'long_term', 'mid_term', 'short_term'].includes(p.layer)
      );
    });
  } catch {
    return [];
  }
}

export function saveMemory(input: {
  layer: MemoryLayer;
  content: string;
  summary: string;
  importance: number;
  tags: string[];
  sourceConversationId: string | null;
  sourceMessageId: string | null;
  emotionalContext: string | null;
}): Memory {
  const db = getDatabase();
  const id = randomUUID();
  db.prepare(`
    INSERT INTO memories (id, layer, content, summary, importance, tags, source_conversation_id, source_message_id, emotional_context)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.layer,
    input.content,
    input.summary,
    Math.max(1, Math.min(10, Math.round(input.importance))),
    JSON.stringify(input.tags || []),
    input.sourceConversationId,
    input.sourceMessageId,
    input.emotionalContext,
  );
  const row = db.prepare('SELECT * FROM memories WHERE id = ?').get(id) as any;
  return {
    id: row.id,
    layer: row.layer,
    content: row.content,
    summary: row.summary,
    importance: row.importance,
    tags: row.tags ? JSON.parse(row.tags) : [],
    source_conversation_id: row.source_conversation_id,
    source_message_id: row.source_message_id,
    emotional_context: row.emotional_context,
    created_at: row.created_at,
    last_accessed: row.last_accessed,
    access_count: row.access_count,
    is_active: row.is_active,
  };
}

export async function extractMemoriesFromConversation(params: {
  apiKey: string;
  conversationId: string;
  assistantMessageId: string;
  recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  importanceThreshold: number;
}): Promise<Memory[]> {
  if (!params.apiKey) return [];

  const excerpt = params.recentMessages
    .slice(-6)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  if (!excerpt.trim() || excerpt.length < 40) return [];

  let raw = '';
  try {
    raw = await anthropicProvider.completeOnce({
      apiKey: params.apiKey,
      model: EXTRACTION_MODEL,
      system: EXTRACTION_SYSTEM,
      messages: [{ role: 'user', content: `Conversation excerpt:\n\n${excerpt}\n\nReturn the JSON array of memories to save.` }],
      temperature: 0.2,
      maxTokens: 1500,
    });
  } catch {
    return [];
  }

  const extracted = parseExtractionResponse(raw);
  const saved: Memory[] = [];
  for (const item of extracted) {
    if (item.importance < params.importanceThreshold) continue;
    saved.push(
      saveMemory({
        layer: item.layer,
        content: item.content.slice(0, 1200),
        summary: item.summary.slice(0, 280),
        importance: item.importance,
        tags: (item.tags || []).slice(0, 5).map((t) => String(t).toLowerCase()),
        sourceConversationId: params.conversationId,
        sourceMessageId: params.assistantMessageId,
        emotionalContext: item.emotional_context ?? null,
      }),
    );
  }
  return saved;
}

export function deleteMemory(id: string): void {
  const db = getDatabase();
  db.prepare('DELETE FROM memories WHERE id = ?').run(id);
}

export function clearAllMemories(): void {
  const db = getDatabase();
  db.exec('DELETE FROM memories;');
}

export function getStats() {
  const db = getDatabase();
  const total = (db.prepare('SELECT COUNT(*) AS c FROM memories WHERE is_active = 1').get() as any).c as number;
  const byLayerRows = db
    .prepare('SELECT layer, COUNT(*) AS c FROM memories WHERE is_active = 1 GROUP BY layer')
    .all() as Array<{ layer: MemoryLayer; c: number }>;
  const byLayer: Record<MemoryLayer, number> = { core_identity: 0, long_term: 0, mid_term: 0, short_term: 0 };
  for (const r of byLayerRows) byLayer[r.layer] = r.c;
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const recentlyAddedCount = (db
    .prepare('SELECT COUNT(*) AS c FROM memories WHERE created_at >= ? AND is_active = 1')
    .get(sevenDaysAgo) as any).c as number;
  return { total, byLayer, recentlyAddedCount };
}
