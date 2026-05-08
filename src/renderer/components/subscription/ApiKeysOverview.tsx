import { useApp } from '../../store/appStore';
import { CollapsibleSection } from '../CollapsibleSection';
import { LockedSection } from '../LockedSection';
import { truncateMiddle } from '../../utils/formatters';

export function ApiKeysOverview({ onAddAdminKey }: { onAddAdminKey: () => void }) {
  const hasAdmin = useApp((s) => s.keys?.hasAdminKey);
  const apiKeys = useApp((s) => s.apiKeys);
  const workspaces = useApp((s) => s.workspaces);

  if (!hasAdmin) {
    return (
      <CollapsibleSection title="API Keys" defaultOpen={false}>
        <LockedSection
          title="API key inventory is locked"
          description="Add an Admin API key to list active organization API keys."
          onAddAdminKey={onAddAdminKey}
        />
      </CollapsibleSection>
    );
  }

  const wsName = (id?: string | null) => {
    if (!id) return '';
    return workspaces.find((w) => w.id === id)?.name ?? truncateMiddle(id, 6, 4);
  };

  return (
    <CollapsibleSection title="API Keys" defaultOpen={false}>
      {apiKeys.length === 0 ? (
        <div className="text-[11px] text-[var(--text-secondary)] text-center py-3">
          No active API keys.
        </div>
      ) : (
        <div className="space-y-1.5">
          {apiKeys.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between rounded-md bg-[var(--bg-primary)] border border-[var(--border)] px-2 py-1.5"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${k.status === 'active' ? 'bg-accent-green' : 'bg-[var(--text-secondary)]'}`}
                />
                <div className="min-w-0">
                  <div className="text-[12px] text-[var(--text-primary)] truncate">{k.name}</div>
                  <div className="text-[10px] font-mono text-[var(--text-secondary)] truncate">
                    {truncateMiddle(k.id, 8, 4)}
                    {k.workspace_id && <span className="ml-2">· {wsName(k.workspace_id)}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}
