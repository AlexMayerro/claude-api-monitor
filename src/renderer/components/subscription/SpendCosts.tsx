import {
  BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useApp } from '../../store/appStore';
import { CollapsibleSection } from '../CollapsibleSection';
import { LockedSection } from '../LockedSection';
import { formatCost } from '../../utils/formatters';
import { estimateCost } from '../../utils/pricing';
import { familyOf, FAMILY_COLORS, FAMILY_LABELS } from '../../utils/constants';

export function SpendCosts({ onAddAdminKey }: { onAddAdminKey: () => void }) {
  const hasAdmin = useApp((s) => s.keys?.hasAdminKey);
  const usageToday = useApp((s) => s.usageToday);
  const usage7d = useApp((s) => s.usage7d);
  const usage30d = useApp((s) => s.usage30d);
  const costs7d = useApp((s) => s.costs7d);

  if (!hasAdmin) {
    return (
      <CollapsibleSection title="Spend & Costs">
        <LockedSection
          title="Cost tracking is locked"
          description="Add an Admin API key to see daily, weekly, and monthly spend with per-model breakdowns."
          onAddAdminKey={onAddAdminKey}
        />
      </CollapsibleSection>
    );
  }

  const todayCost = usageToday.reduce(
    (a, b) => a + b.results.reduce((x, r) => x + estimateCost(r).total, 0), 0,
  );
  const week = usage7d.reduce(
    (a, b) => a + b.results.reduce((x, r) => x + estimateCost(r).total, 0), 0,
  );
  const month = usage30d.reduce(
    (a, b) => a + b.results.reduce((x, r) => x + estimateCost(r).total, 0), 0,
  );

  // Build per-day stacked chart from usage7d.
  const chartData = usage7d.map((b) => {
    const day = new Date(b.starting_at).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric',
    });
    let opus = 0, sonnet = 0, haiku = 0;
    for (const r of b.results) {
      const c = estimateCost(r).total;
      const fam = familyOf(r.model);
      if (fam === 'opus') opus += c;
      else if (fam === 'sonnet') sonnet += c;
      else if (fam === 'haiku') haiku += c;
    }
    return { day, opus, sonnet, haiku };
  });

  // Per-model totals over 7d
  const modelTotals: Record<'opus' | 'sonnet' | 'haiku', { input: number; output: number; cost: number }> = {
    opus: { input: 0, output: 0, cost: 0 },
    sonnet: { input: 0, output: 0, cost: 0 },
    haiku: { input: 0, output: 0, cost: 0 },
  };
  for (const b of usage7d) {
    for (const r of b.results) {
      const fam = familyOf(r.model);
      if (!fam) continue;
      modelTotals[fam].input += (r.uncached_input_tokens ?? 0) + (r.cache_read_input_tokens ?? 0);
      modelTotals[fam].output += r.output_tokens ?? 0;
      modelTotals[fam].cost += estimateCost(r).total;
    }
  }
  const grand = Object.values(modelTotals).reduce(
    (acc, v) => ({ input: acc.input + v.input, output: acc.output + v.output, cost: acc.cost + v.cost }),
    { input: 0, output: 0, cost: 0 },
  );

  // Use cost report data if present (more authoritative), else estimate
  const costReportTotal = costs7d.reduce(
    (a, b) => a + b.results.reduce((x, r) => x + (r.amount ?? 0), 0), 0,
  );
  const weekDisplay = costReportTotal > 0 ? costReportTotal : week;

  return (
    <CollapsibleSection title="Spend & Costs">
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="Today" value={formatCost(todayCost)} hint="Estimated" />
        <Stat label="This Week" value={formatCost(weekDisplay)} />
        <Stat label="This Month" value={formatCost(month)} />
      </div>

      <div className="rounded-md bg-[var(--bg-primary)] border border-[var(--border)] p-2">
        <div className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)] mb-2 px-1">
          Cost Breakdown (7d)
        </div>
        <div style={{ width: '100%', height: 140 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} width={28} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: 11,
                  color: 'var(--text-primary)',
                }}
                formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, FAMILY_LABELS[name as 'opus'|'sonnet'|'haiku']]}
              />
              <Bar dataKey="opus" stackId="a" fill={FAMILY_COLORS.opus} />
              <Bar dataKey="sonnet" stackId="a" fill={FAMILY_COLORS.sonnet} />
              <Bar dataKey="haiku" stackId="a" fill={FAMILY_COLORS.haiku} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 rounded-md bg-[var(--bg-primary)] border border-[var(--border)] overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-2 py-1.5 border-b border-[var(--border)] text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">
          <span>Model</span>
          <span className="text-right">Input</span>
          <span className="text-right">Output</span>
          <span className="text-right">Cost</span>
        </div>
        {(['opus', 'sonnet', 'haiku'] as const).map((fam) => (
          <Row
            key={fam}
            color={FAMILY_COLORS[fam]}
            label={FAMILY_LABELS[fam]}
            input={modelTotals[fam].input}
            output={modelTotals[fam].output}
            cost={modelTotals[fam].cost}
          />
        ))}
        <Row
          bold color="var(--border)"
          label="Total"
          input={grand.input}
          output={grand.output}
          cost={grand.cost}
        />
      </div>
    </CollapsibleSection>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md bg-[var(--bg-primary)] border border-[var(--border)] px-2 py-2">
      <div className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">{label}</div>
      <div className="text-[13px] font-semibold text-[var(--text-primary)] mt-0.5">{value}</div>
      {hint && <div className="text-[9px] text-[var(--text-secondary)]">{hint}</div>}
    </div>
  );
}

function Row({ color, label, input, output, cost, bold }: {
  color: string; label: string; input: number; output: number; cost: number; bold?: boolean;
}) {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toLocaleString();
  return (
    <div className={`grid grid-cols-4 gap-2 px-2 py-1.5 text-[11px] border-t border-[var(--border)] first:border-t-0 ${bold ? 'font-semibold' : ''}`}>
      <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="text-right text-[var(--text-primary)]">{fmt(input)}</span>
      <span className="text-right text-[var(--text-primary)]">{fmt(output)}</span>
      <span className="text-right text-[var(--text-primary)]">{formatCost(cost)}</span>
    </div>
  );
}
