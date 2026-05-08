import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useApp } from '../../store/appStore';
import { formatRelativeAgo } from '../../utils/formatters';
import { refreshAll } from '../../hooks/useAutoRefresh';

export function ConnectionStatus() {
  const apiStatus = useApp((s) => s.apiStatus);
  const apiError = useApp((s) => s.apiError);
  const lastUpdated = useApp((s) => s.lastUpdatedMs);
  const rateLimits = useApp((s) => s.rateLimits);
  const [now, setNow] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ok = apiStatus === 'connected';
  const dotColor = ok ? 'bg-accent-green' : apiStatus === 'connecting' ? 'bg-accent-amber' : 'bg-accent-red';
  const label = ok ? 'API Connected' : apiStatus === 'connecting' ? 'Connecting…' : 'Disconnected';
  const updatedAgo = lastUpdated ? `Updated ${formatRelativeAgo(lastUpdated, now)} ago` : 'Updating…';

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll({ probe: true });
    setRefreshing(false);
  };

  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] p-3 space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="text-[12px] font-medium text-[var(--text-primary)]">{label}</span>
        </div>
        <span className="text-[10px] text-[var(--text-secondary)]">{updatedAgo}</span>
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[var(--text-secondary)]">Endpoint</span>
        <span className="text-[var(--text-primary)] font-mono text-[10px]">api.anthropic.com</span>
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[var(--text-secondary)]">Latency</span>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-primary)]">
            {rateLimits?.latencyMs !== undefined ? `${rateLimits.latencyMs}ms` : '—'}
          </span>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="Refresh"
          >
            <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      {!ok && apiError && (
        <div className="text-[11px] text-accent-red mt-1">{apiError}</div>
      )}
    </div>
  );
}
