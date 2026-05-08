import { Lock } from 'lucide-react';

export function LockedSection({ title, description, onAddAdminKey }: {
  title: string; description: string; onAddAdminKey: () => void;
}) {
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Lock size={13} className="text-accent-amber" />
        <span className="text-[12px] font-semibold text-[var(--text-primary)]">{title}</span>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)]">{description}</p>
      <button
        onClick={onAddAdminKey}
        className="h-7 px-3 rounded bg-accent-blue text-white text-[11px] font-medium hover:brightness-110"
      >
        Add Admin Key
      </button>
    </div>
  );
}
