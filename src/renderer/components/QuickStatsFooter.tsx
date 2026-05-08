import { ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { useApp } from '../store/appStore';
import { formatNumber, formatCostSmall } from '../utils/formatters';
import { estimateCost } from '../utils/pricing';

export function QuickStatsFooter() {
  const usageToday = useApp((s) => s.usageToday);
  const hasAdmin = useApp((s) => s.keys?.hasAdminKey);

  let totalIn = 0;
  let totalOut = 0;
  let totalCost = 0;
  for (const bucket of usageToday) {
    for (const r of bucket.results) {
      totalIn += (r.uncached_input_tokens ?? 0) + (r.cache_read_input_tokens ?? 0);
      totalOut += r.output_tokens ?? 0;
      totalCost += estimateCost(r).total;
    }
  }

  const display = hasAdmin
    ? {
        input: formatNumber(totalIn),
        output: formatNumber(totalOut),
        cost: formatCostSmall(totalCost),
      }
    : { input: '—', output: '—', cost: '—' };

  return (
    <div className="flex items-center justify-around px-3 py-2 border-t border-[var(--border)] bg-[var(--bg-primary)] text-[11px]">
      <div className="flex items-center gap-1 text-[var(--text-primary)]">
        <ArrowUp size={12} className="text-accent-green" />
        <span className="font-medium">{display.input}</span>
        <span className="text-[var(--text-secondary)]">in</span>
      </div>
      <div className="flex items-center gap-1 text-[var(--text-primary)]">
        <ArrowDown size={12} className="text-accent-blue" />
        <span className="font-medium">{display.output}</span>
        <span className="text-[var(--text-secondary)]">out</span>
      </div>
      <div className="flex items-center gap-1 text-[var(--text-primary)]">
        <DollarSign size={12} className="text-accent-amber" />
        <span className="font-medium">{display.cost}</span>
        <span className="text-[var(--text-secondary)]">today</span>
      </div>
    </div>
  );
}
