import { User } from 'lucide-react';
import { useApp } from '../../store/appStore';
import { CollapsibleSection } from '../CollapsibleSection';
import { LockedSection } from '../LockedSection';

const ROLE_COLORS: Record<string, string> = {
  admin: '#A78BFA',
  developer: '#6C8CFF',
  billing: '#FBBF24',
  user: '#8888A8',
  claude_code_user: '#2DD4BF',
};

export function TeamMembers({ onAddAdminKey }: { onAddAdminKey: () => void }) {
  const hasAdmin = useApp((s) => s.keys?.hasAdminKey);
  const users = useApp((s) => s.orgUsers);

  if (!hasAdmin) {
    return (
      <CollapsibleSection title="Team Members" defaultOpen={false}>
        <LockedSection
          title="Team list is locked"
          description="Add an Admin API key to view organization members."
          onAddAdminKey={onAddAdminKey}
        />
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection title="Team Members" defaultOpen={false}>
      {users.length === 0 ? (
        <div className="text-[11px] text-[var(--text-secondary)] text-center py-3">No members.</div>
      ) : (
        <>
          <div className="space-y-1.5">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-md bg-[var(--bg-primary)] border border-[var(--border)] px-2 py-1.5"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <User size={13} className="text-[var(--text-secondary)] flex-shrink-0" />
                  <span className="text-[12px] text-[var(--text-primary)] truncate" title={u.email ?? u.name ?? u.id}>
                    {u.name || u.email || u.id}
                  </span>
                </div>
                <RoleBadge role={u.role} />
              </div>
            ))}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] text-right mt-2">
            {users.length} member{users.length === 1 ? '' : 's'}
          </div>
        </>
      )}
    </CollapsibleSection>
  );
}

function RoleBadge({ role }: { role: string }) {
  const color = ROLE_COLORS[role] ?? ROLE_COLORS.user;
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {role}
    </span>
  );
}
