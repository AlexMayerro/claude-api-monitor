import { useApp } from '../../store/appStore';
import { CollapsibleSection } from '../CollapsibleSection';
import { LockedSection } from '../LockedSection';
import { truncateMiddle } from '../../utils/formatters';

export function Workspaces({ onAddAdminKey }: { onAddAdminKey: () => void }) {
  const hasAdmin = useApp((s) => s.keys?.hasAdminKey);
  const workspaces = useApp((s) => s.workspaces);

  if (!hasAdmin) {
    return (
      <CollapsibleSection title="Workspaces" defaultOpen={false}>
        <LockedSection
          title="Workspaces are locked"
          description="Add an Admin API key to view organization workspaces."
          onAddAdminKey={onAddAdminKey}
        />
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection title="Workspaces" defaultOpen={false}>
      {workspaces.length === 0 ? (
        <div className="text-[11px] text-[var(--text-secondary)] text-center py-3">No workspaces.</div>
      ) : (
        <div className="space-y-1.5">
          {workspaces.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between rounded-md bg-[var(--bg-primary)] border border-[var(--border)] px-2 py-1.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: w.display_color || '#6C8CFF' }}
                />
                <span className="text-[12px] text-[var(--text-primary)] truncate">{w.name}</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] flex-shrink-0">
                {truncateMiddle(w.id, 6, 4)}
              </span>
            </div>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}
