import { CollapsibleSection } from '../CollapsibleSection';
import { RateLimitCard } from './RateLimitCard';
import { useApp } from '../../store/appStore';
import { MODEL_FAMILIES, PROBE_MODEL, familyOf } from '../../utils/constants';

export function RateLimits() {
  const rl = useApp((s) => s.rateLimits);
  const probeFam = familyOf(PROBE_MODEL);

  return (
    <CollapsibleSection title="Rate Limits">
      <div className="space-y-2">
        {MODEL_FAMILIES.map((fam) => (
          <RateLimitCard key={fam} family={fam} rl={rl} isProbeFamily={fam === probeFam} />
        ))}
      </div>
      <p className="text-[10px] text-[var(--text-secondary)] mt-2">
        Rate data from last probe · Cost: ~$0.003/day
      </p>
    </CollapsibleSection>
  );
}
