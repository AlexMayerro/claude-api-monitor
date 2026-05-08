import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useApp } from '../../store/appStore';
import { CollapsibleSection } from '../CollapsibleSection';
import { LockedSection } from '../LockedSection';
import type { UsagePeriod } from '../../store/appStore';
import { familyOf, FAMILY_COLORS, FAMILY_LABELS } from '../../utils/constants';
import { formatNumber, formatCost } from '../../utils/formatters';
import { estimateCost } from '../../utils/pricing';
import type { UsageBucket } from '../../utils/api-types';

const PERIODS: { id: UsagePeriod; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
];

export function UsageHistory({ onAddAdminKey }: { onAddAdminKey: () => void }) {
  const hasAdmin = useApp((s) => s.keys?.hasAdminKey);
  const period = useApp((s) => s.usagePeriod);
  const setPeriod = useApp((s) => s.setUsagePeriod);
  const compact = useApp((s) => s.settings?.compactMode);
  const usageToday = useApp((s) => s.usageToday);
  const usage7d = useApp((s) => s.usage7d);
  const usage30d = useApp((s) => s.usage30d);

  if (!hasAdmin) {
    return (
      <CollapsibleSection title="Usage History">
        <LockedSection
          title="Usage history is locked"
          description="Add an Admin API key to view hourly and daily token usage by model."
          onAddAdminKey={onAddAdminKey}
        />
      </CollapsibleSection>
    );
  }

  const buckets: UsageBucket[] =
    period === 'today' ? usageToday : period === '7d' ? usage7d : usage30d;

  const chartData = buckets.map((b) => {
    const isHourly = period === 'today';
    const date = new Date(b.starting_at);
    const label = isHourly
      ? `${String(date.getHours()).padStart(2, '0')}:00`
      : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    let opus = 0, sonnet = 0, haiku = 0;
    for (const r of b.results) {
      const tokens = (r.uncached_input_tokens ?? 0) + (r.cache_read_input_tokens ?? 0) + (r.output_tokens ?? 0);
      const fam = familyOf(r.model);
      if (fam === 'opus') opus += tokens;
      else if (fam === 'sonnet') sonnet += tokens;
      else if (fam === 'haiku') haiku += tokens;
    }
    return { label, opus, sonnet, haiku };
  });

  // Per-model totals
  const totals: Record<'opus'|'sonnet'|'haiku', {
    input: number; output: number; cacheRead: number; cacheCreated: number;
    cacheReadCost: number; cacheCreateCost: number;
    inputCost: number; outputCost: number;
    webSearches: number; webSearchCost: number;
    sparkline: number[];
  }> = {
    opus: { input: 0, output: 0, cacheRead: 0, cacheCreated: 0, cacheReadCost: 0, cacheCreateCost: 0, inputCost: 0, outputCost: 0, webSearches: 0, webSearchCost: 0, sparkline: [] },
    sonnet: { input: 0, output: 0, cacheRead: 0, cacheCreated: 0, cacheReadCost: 0, cacheCreateCost: 0, inputCost: 0, outputCost: 0, webSearches: 0, webSearchCost: 0, sparkline: [] },
    haiku: { input: 0, output: 0, cacheRead: 0, cacheCreated: 0, cacheReadCost: 0, cacheCreateCost: 0, inputCost: 0, outputCost: 0, webSearches: 0, webSearchCost: 0, sparkline: [] },
  };
  for (const b of buckets) {
    const perBucket = { opus: 0, sonnet: 0, haiku: 0 };
    for (const r of b.results) {
      const fam = familyOf(r.model);
      if (!fam) continue;
      const c = estimateCost(r);
      const cacheCreated =
        (r.cache_creation?.ephemeral_1h_input_tokens ?? 0) + (r.cache_creation?.ephemeral_5m_input_tokens ?? 0);
      totals[fam].input += r.uncached_input_tokens ?? 0;
      totals[fam].output += r.output_tokens ?? 0;
      totals[fam].cacheRead += r.cache_read_input_tokens ?? 0;
      totals[fam].cacheCreated += cacheCreated;
      totals[fam].inputCost += c.input;
      totals[fam].outputCost += c.output;
      totals[fam].cacheReadCost += c.cacheRead;
      totals[fam].cacheCreateCost += c.cacheWrite;
      totals[fam].webSearches += r.server_tool_use?.web_search_requests ?? 0;
      totals[fam].webSearchCost += c.webSearch;
      perBucket[fam] += c.total;
    }
    (['opus', 'sonnet', 'haiku'] as const).forEach((f) => totals[f].sparkline.push(perBucket[f]));
  }

  return (
    <CollapsibleSection
      title="Usage History"
      right={
        <div className="flex items-center bg-[var(--bg-tertiary)] rounded-md p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={(e) => { e.stopPropagation(); setPeriod(p.id); }}
              className={`px-2 py-0.5 text-[10px] rounded ${
                period === p.id
                  ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="rounded-md bg-[var(--bg-primary)] border border-[var(--border)] p-2">
        <div style={{ width: '100%', height: 140 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                {(['opus', 'sonnet', 'haiku'] as const).map((f) => (
                  <linearGradient key={f} id={`grad-${f}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={FAMILY_COLORS[f]} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={FAMILY_COLORS[f]} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} width={32} tickFormatter={formatNumber} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: 11,
                  color: 'var(--text-primary)',
                }}
                formatter={(value: number, name: string) => [formatNumber(value), FAMILY_LABELS[name as 'opus'|'sonnet'|'haiku']]}
              />
              <Area type="monotone" dataKey="opus" stackId="1" stroke={FAMILY_COLORS.opus} fill={`url(#grad-opus)`} />
              <Area type="monotone" dataKey="sonnet" stackId="1" stroke={FAMILY_COLORS.sonnet} fill={`url(#grad-sonnet)`} />
              <Area type="monotone" dataKey="haiku" stackId="1" stroke={FAMILY_COLORS.haiku} fill={`url(#grad-haiku)`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {(['opus', 'sonnet', 'haiku'] as const).map((fam) => {
          const t = totals[fam];
          const totalCost = t.inputCost + t.outputCost + t.cacheReadCost + t.cacheCreateCost + t.webSearchCost;
          const showAny = t.input > 0 || t.output > 0 || t.cacheRead > 0 || t.cacheCreated > 0;
          if (!showAny) return null;
          return (
            <div
              key={fam}
              className="rounded-md bg-[var(--bg-primary)] border border-[var(--border)] p-2 pl-3"
              style={{ borderLeft: `3px solid ${FAMILY_COLORS[fam]}` }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                  {FAMILY_LABELS[fam]}
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">{formatCost(totalCost)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                <DetailRow label="Input" tokens={t.input} cost={t.inputCost} />
                <DetailRow label="Output" tokens={t.output} cost={t.outputCost} />
                <DetailRow label="Cached" tokens={t.cacheRead} cost={t.cacheReadCost} suffix="(read)" />
                <DetailRow label="Cache Created" tokens={t.cacheCreated} cost={t.cacheCreateCost} />
                {t.webSearches > 0 && (
                  <div className="col-span-2 flex justify-between text-[var(--text-secondary)]">
                    <span>Web Searches: {t.webSearches}</span>
                    <span>{formatCost(t.webSearchCost)}</span>
                  </div>
                )}
              </div>
              {!compact && t.sparkline.length > 1 && (
                <div className="mt-1.5" style={{ width: '100%', height: 36 }}>
                  <ResponsiveContainer>
                    <AreaChart data={t.sparkline.map((v, i) => ({ i, v }))}>
                      <defs>
                        <linearGradient id={`spark-${fam}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={FAMILY_COLORS[fam]} stopOpacity={0.7} />
                          <stop offset="100%" stopColor={FAMILY_COLORS[fam]} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={FAMILY_COLORS[fam]} fill={`url(#spark-${fam})`} strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          );
        })}
        {(['opus', 'sonnet', 'haiku'] as const).every((f) => totals[f].input + totals[f].output === 0) && (
          <div className="text-[11px] text-[var(--text-secondary)] text-center py-3">
            No usage data for this period.
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}

function DetailRow({ label, tokens, cost, suffix }: { label: string; tokens: number; cost: number; suffix?: string }) {
  return (
    <div className="flex justify-between gap-2 text-[var(--text-secondary)]">
      <span>{label}{suffix ? ` ${suffix}` : ''}</span>
      <span className="text-[var(--text-primary)]">
        {formatNumber(tokens)} <span className="text-[var(--text-secondary)]">({formatCost(cost)})</span>
      </span>
    </div>
  );
}
