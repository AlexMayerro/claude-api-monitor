import { useEffect, useState } from 'react';
import { ProgressBar } from '../ProgressBar';
import { formatNumber, formatCountdown } from '../../utils/formatters';
import type { ModelFamily } from '../../utils/constants';
import { FAMILY_COLORS, FAMILY_LABELS } from '../../utils/constants';
import type { RateLimitHeaders } from '../../utils/api-types';

interface Props {
  family: ModelFamily;
  rl?: RateLimitHeaders;
  isProbeFamily: boolean;
}

export function RateLimitCard({ family, rl, isProbeFamily }: Props) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Rate limit headers come from the probe call (which targets Haiku). For other
  // model families we cannot directly observe limits without probing each one,
  // so we display a hint instead. This is intentional — see the README.
  const showLimits = isProbeFamily && !!rl?.requestsLimit;
  const isLimited = rl?.status === 429;
  const reset = rl?.requestsReset || rl?.tokensReset || rl?.inputReset;
  const resetsIn = formatCountdown(reset, now);

  return (
    <div
      className="rounded-md bg-[var(--bg-primary)] border border-[var(--border)] p-2.5 pl-3"
      style={{ borderLeft: `3px solid ${FAMILY_COLORS[family]}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: FAMILY_COLORS[family] }} />
          <span className="text-[12px] font-semibold text-[var(--text-primary)]">
            {FAMILY_LABELS[family]}
          </span>
        </div>
        {isLimited && isProbeFamily && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-accent-red px-1.5 py-0.5 rounded rate-limited-pulse">
            Rate Limited{rl?.retryAfter ? ` · ${rl.retryAfter}s` : ''}
          </span>
        )}
      </div>

      {!showLimits ? (
        <div className="text-[10px] text-[var(--text-secondary)] py-1">
          {isProbeFamily
            ? 'Awaiting probe…'
            : 'Rate limits are observed during API calls. Run a request against this model family to see live counters.'}
        </div>
      ) : (
        <div className="space-y-2">
          <Bar
            label="Requests"
            used={(rl!.requestsLimit ?? 0) - (rl!.requestsRemaining ?? 0)}
            limit={rl!.requestsLimit ?? 0}
            unit="RPM"
            color={FAMILY_COLORS[family]}
          />
          {rl!.inputLimit !== undefined && (
            <Bar
              label="Input Tkns"
              used={(rl!.inputLimit ?? 0) - (rl!.inputRemaining ?? 0)}
              limit={rl!.inputLimit ?? 0}
              unit="ITPM"
              color={FAMILY_COLORS[family]}
            />
          )}
          {rl!.outputLimit !== undefined && (
            <Bar
              label="Output Tkns"
              used={(rl!.outputLimit ?? 0) - (rl!.outputRemaining ?? 0)}
              limit={rl!.outputLimit ?? 0}
              unit="OTPM"
              color={FAMILY_COLORS[family]}
            />
          )}
          <div className="text-[10px] text-[var(--text-secondary)] pt-0.5">
            Resets in: {resetsIn}
          </div>
        </div>
      )}
    </div>
  );
}

function Bar({ label, used, limit, unit, color }: {
  label: string; used: number; limit: number; unit: string; color: string;
}) {
  const remaining = Math.max(0, limit - used);
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-0.5">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="text-[var(--text-primary)] font-mono tabular-nums">
          {formatNumber(used)} / {formatNumber(limit)} {unit}
          <span className="text-[var(--text-secondary)] ml-1">({formatNumber(remaining)} left)</span>
        </span>
      </div>
      <ProgressBar value={used} max={limit} baseColor={color} />
    </div>
  );
}
