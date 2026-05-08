interface Props {
  value: number;
  max: number;
  baseColor: string;
}

export function ProgressBar({ value, max, baseColor }: Props) {
  const pctRaw = max > 0 ? value / max : 0;
  const pct = Math.max(0, Math.min(1, pctRaw));
  // Color shifts: <70% baseColor, 70-90% amber, >90% red.
  let color = baseColor;
  if (pct >= 0.9) color = '#F87171';
  else if (pct >= 0.7) color = '#FBBF24';

  return (
    <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{ width: `${pct * 100}%`, backgroundColor: color }}
      />
    </div>
  );
}
