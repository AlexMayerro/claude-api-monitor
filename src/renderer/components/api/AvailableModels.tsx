import { useApp } from '../../store/appStore';
import { CollapsibleSection } from '../CollapsibleSection';
import { ModelCard } from './ModelCard';
import { familyOf, MODEL_FAMILIES } from '../../utils/constants';
import type { ModelInfo } from '../../utils/api-types';

const FAMILY_PRIORITY: Record<string, number> = { opus: 0, sonnet: 1, haiku: 2 };

function sortModels(models: ModelInfo[]): ModelInfo[] {
  return [...models].sort((a, b) => {
    const fa = familyOf(a.id);
    const fb = familyOf(b.id);
    const pa = fa ? FAMILY_PRIORITY[fa] : 99;
    const pb = fb ? FAMILY_PRIORITY[fb] : 99;
    if (pa !== pb) return pa - pb;
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return db - da;
  });
}

export function AvailableModels() {
  const models = useApp((s) => s.models);
  const sorted = sortModels(models.filter((m) => MODEL_FAMILIES.includes(familyOf(m.id) as 'opus' | 'sonnet' | 'haiku')));

  return (
    <CollapsibleSection title="Available Models">
      {sorted.length === 0 ? (
        <div className="text-[11px] text-[var(--text-secondary)] text-center py-3">
          No models loaded.
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}
