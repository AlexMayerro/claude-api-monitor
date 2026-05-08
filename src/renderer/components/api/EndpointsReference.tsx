import { CollapsibleSection } from '../CollapsibleSection';
import { useApp } from '../../store/appStore';

const ENDPOINTS: Array<{ method: 'GET' | 'POST'; path: string }> = [
  { method: 'POST', path: '/v1/messages' },
  { method: 'POST', path: '/v1/messages/count_tokens' },
  { method: 'POST', path: '/v1/messages/batches' },
  { method: 'GET', path: '/v1/models' },
  { method: 'GET', path: '/v1/models/{id}' },
];

export function EndpointsReference() {
  const apiStatus = useApp((s) => s.apiStatus);
  const online = apiStatus === 'connected';

  return (
    <CollapsibleSection title="Endpoints" defaultOpen={false}>
      <div className="space-y-1">
        {ENDPOINTS.map((e) => (
          <div
            key={`${e.method} ${e.path}`}
            className="flex items-center justify-between px-2 py-1.5 rounded-md bg-[var(--bg-primary)] border border-[var(--border)]"
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider ${
                  e.method === 'GET'
                    ? 'bg-accent-green/20 text-accent-green'
                    : 'bg-accent-blue/20 text-accent-blue'
                }`}
              >
                {e.method}
              </span>
              <span className="text-[11px] font-mono text-[var(--text-primary)]">{e.path}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-accent-green' : 'bg-accent-red'}`} />
              <span className="text-[10px] text-[var(--text-secondary)]">
                {online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
