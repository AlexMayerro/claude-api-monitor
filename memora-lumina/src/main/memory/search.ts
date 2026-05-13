import { getDatabase } from '../database';
import type { Memory, MemoryFilters, MemorySearchResult, MemoryLayer } from '../../shared/types';

function rowToMemory(row: any): Memory {
  return {
    id: row.id,
    layer: row.layer,
    content: row.content,
    summary: row.summary,
    importance: row.importance,
    tags: safeParseTags(row.tags),
    source_conversation_id: row.source_conversation_id,
    source_message_id: row.source_message_id,
    emotional_context: row.emotional_context,
    created_at: row.created_at,
    last_accessed: row.last_accessed,
    access_count: row.access_count,
    is_active: row.is_active,
  };
}

function safeParseTags(tags: string | null): string[] {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildFilterClause(filters: MemoryFilters): { clause: string; params: any[] } {
  const parts: string[] = ['is_active = 1'];
  const params: any[] = [];
  if (filters.layers && filters.layers.length > 0) {
    parts.push(`layer IN (${filters.layers.map(() => '?').join(',')})`);
    params.push(...filters.layers);
  }
  if (filters.minImportance !== undefined) {
    parts.push('importance >= ?');
    params.push(filters.minImportance);
  }
  if (filters.maxImportance !== undefined) {
    parts.push('importance <= ?');
    params.push(filters.maxImportance);
  }
  if (filters.startDate) {
    parts.push('created_at >= ?');
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    parts.push('created_at <= ?');
    params.push(filters.endDate);
  }
  return { clause: parts.join(' AND '), params };
}

function sortClause(sort?: MemoryFilters['sortBy']): string {
  switch (sort) {
    case 'oldest':
      return 'created_at ASC';
    case 'importance':
      return 'importance DESC, created_at DESC';
    case 'newest':
    default:
      return 'created_at DESC';
  }
}

export function listMemories(filters: MemoryFilters): Memory[] {
  const db = getDatabase();
  const { clause, params } = buildFilterClause(filters);
  const limit = filters.limit ?? 500;
  const offset = filters.offset ?? 0;
  const stmt = db.prepare(`
    SELECT * FROM memories
    WHERE ${clause}
    ORDER BY ${sortClause(filters.sortBy)}
    LIMIT ? OFFSET ?
  `);
  const rows = stmt.all(...params, limit, offset) as any[];
  return rows.map(rowToMemory);
}

function escapeFtsQuery(input: string): string {
  const tokens = input
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (!tokens.length) return '';
  return tokens.map((t) => `"${t}"*`).join(' OR ');
}

export function searchMemories(query: string, filters: MemoryFilters): MemorySearchResult[] {
  const db = getDatabase();
  if (!query.trim()) {
    return listMemories(filters).map((m) => ({ memory: m, matchCount: 0, snippet: m.summary }));
  }
  const ftsQuery = escapeFtsQuery(query);
  if (!ftsQuery) return [];
  const { clause, params } = buildFilterClause(filters);
  const limit = filters.limit ?? 200;
  const stmt = db.prepare(`
    SELECT m.*,
           snippet(memories_fts, 0, '<mark>', '</mark>', '...', 24) AS snippet,
           bm25(memories_fts) AS rank
    FROM memories_fts
    JOIN memories m ON m.rowid = memories_fts.rowid
    WHERE memories_fts MATCH ?
      AND ${clause}
    ORDER BY rank LIMIT ?
  `);
  const rows = stmt.all(ftsQuery, ...params, limit) as any[];
  const lowerQuery = query.toLowerCase();
  return rows.map((row) => {
    const memory = rowToMemory(row);
    const haystack = `${memory.content} ${memory.summary} ${memory.tags.join(' ')}`.toLowerCase();
    let count = 0;
    let idx = 0;
    while ((idx = haystack.indexOf(lowerQuery, idx)) !== -1) {
      count++;
      idx += lowerQuery.length;
    }
    return { memory, matchCount: count || 1, snippet: row.snippet || memory.summary };
  });
}

export function rankMemoriesForInjection(
  userMessage: string,
  layers: MemoryLayer[] = ['long_term', 'mid_term', 'short_term'],
  maxResults: number = 8,
): Memory[] {
  const db = getDatabase();
  const ftsQuery = escapeFtsQuery(userMessage);
  if (!ftsQuery) return [];
  const placeholders = layers.map(() => '?').join(',');
  const stmt = db.prepare(`
    SELECT m.*, bm25(memories_fts) AS rank
    FROM memories_fts
    JOIN memories m ON m.rowid = memories_fts.rowid
    WHERE memories_fts MATCH ?
      AND m.is_active = 1
      AND m.layer IN (${placeholders})
    ORDER BY rank
    LIMIT ?
  `);
  const rows = stmt.all(ftsQuery, ...layers, maxResults * 3) as any[];
  const now = Date.now();
  const scored = rows.map((row) => {
    const memory = rowToMemory(row);
    const rawRank = row.rank as number;
    const ftsScore = Math.max(0, -rawRank);
    const importanceWeight = memory.importance * 1.5;
    const ageDays = Math.max(0, (now - new Date(memory.created_at).getTime()) / 86400000);
    const recencyBonus = ageDays < 7 ? 2 : ageDays < 30 ? 1 : 0;
    const accessBonus = Math.min(memory.access_count * 0.2, 1.5);
    const total = ftsScore + importanceWeight + recencyBonus + accessBonus;
    return { memory, score: total };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults).map((s) => s.memory);
}

export function bumpAccess(memoryIds: string[]): void {
  if (!memoryIds.length) return;
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE memories
    SET access_count = access_count + 1,
        last_accessed = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const tx = db.transaction((ids: string[]) => {
    for (const id of ids) stmt.run(id);
  });
  tx(memoryIds);
}
