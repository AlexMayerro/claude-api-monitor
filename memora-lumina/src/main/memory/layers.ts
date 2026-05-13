import { getDatabase } from '../database';
import type { Memory, MemoryLayer } from '../../shared/types';

export interface PromotionOptions {
  mode: 'every_chat' | 'daily' | 'weekly' | 'manual';
}

const LAYER_AGE_DAYS: Record<MemoryLayer, number> = {
  short_term: 1,
  mid_term: 14,
  long_term: 180,
  core_identity: Infinity,
};

function ageInDays(dateStr: string): number {
  return (Date.now() - new Date(dateStr).getTime()) / 86400000;
}

export function consolidateMemories(): { promoted: number; demoted: number; deactivated: number } {
  const db = getDatabase();
  let promoted = 0;
  let demoted = 0;
  let deactivated = 0;

  const promoteToMid = db.prepare(`
    UPDATE memories SET layer = 'mid_term'
    WHERE id = ? AND layer = 'short_term'
  `);
  const promoteToLong = db.prepare(`
    UPDATE memories SET layer = 'long_term'
    WHERE id = ? AND layer = 'mid_term'
  `);
  const deactivate = db.prepare(`
    UPDATE memories SET is_active = 0 WHERE id = ?
  `);

  const all = db
    .prepare(`SELECT id, layer, importance, access_count, created_at, last_accessed FROM memories WHERE is_active = 1`)
    .all() as Array<{ id: string; layer: MemoryLayer; importance: number; access_count: number; created_at: string; last_accessed: string }>;

  const tx = db.transaction(() => {
    for (const m of all) {
      if (m.layer === 'core_identity') continue;
      const age = ageInDays(m.created_at);
      const recentAccess = ageInDays(m.last_accessed) < 7;

      if (m.layer === 'short_term') {
        if (age > LAYER_AGE_DAYS.short_term && (m.importance >= 4 || m.access_count >= 1)) {
          promoteToMid.run(m.id);
          promoted++;
        } else if (age > 3 && m.importance < 3 && m.access_count === 0) {
          deactivate.run(m.id);
          deactivated++;
        }
      } else if (m.layer === 'mid_term') {
        if (age > LAYER_AGE_DAYS.mid_term && (m.importance >= 6 || m.access_count >= 3)) {
          promoteToLong.run(m.id);
          promoted++;
        } else if (age > 30 && m.importance < 4 && !recentAccess) {
          deactivate.run(m.id);
          deactivated++;
        }
      } else if (m.layer === 'long_term') {
        if (age > 365 && m.importance < 5 && !recentAccess && m.access_count < 2) {
          deactivate.run(m.id);
          deactivated++;
        }
      }
    }
  });
  tx();
  return { promoted, demoted, deactivated };
}

export function getCoreIdentityMemories(): Memory[] {
  const db = getDatabase();
  const rows = db
    .prepare(`SELECT * FROM memories WHERE layer = 'core_identity' AND is_active = 1 ORDER BY importance DESC, created_at ASC`)
    .all() as any[];
  return rows.map((row) => ({
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
  }));
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
