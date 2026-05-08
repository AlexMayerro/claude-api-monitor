import { Lock } from 'lucide-react';
import { useApp } from '../../store/appStore';
import { formatRelativeAgo } from '../../utils/formatters';
import { useEffect, useState } from 'react';

export function AccountOverview({ onAddAdminKey }: { onAddAdminKey: () => void }) {
  const keys = useApp((s) => s.keys);
  const org = useApp((s) => s.org);
  const adminStatus = useApp((s) => s.adminStatus);
  const lastUpdated = useApp((s) => s.lastUpdatedMs);
  const models = useApp((s) => s.models);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const updatedAgo = lastUpdated ? `Updated ${formatRelativeAgo(lastUpdated, now)} ago` : 'Updating…';

  if (keys?.hasAdminKey && org) {
    return (
      <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-green" />
            <span className="text-[12px] font-medium text-[var(--text-primary)]">Connected</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">{updatedAgo}</span>
        </div>
        <Field label="Organization" value={org.name} />
        <Field label="Org ID" value={org.id} mono />
        <Field label="Account Type" value={org.account_type ?? 'Organization'} />
        {org.usage_tier && <Field label="Usage Tier" value={org.usage_tier} />}
        {typeof org.monthly_spend_limit === 'number' && (
          <Field label="Monthly Spend Limit" value={`$${org.monthly_spend_limit.toLocaleString()}`} />
        )}
        {typeof org.max_credit_purchase === 'number' && (
          <Field label="Max Credit Purchase" value={`$${org.max_credit_purchase.toLocaleString()}`} />
        )}
      </div>
    );
  }

  if (keys?.hasAdminKey && adminStatus === 'error') {
    return (
      <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-amber" />
          <span className="text-[12px] font-medium text-[var(--text-primary)]">
            Admin API requires an organization account
          </span>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)]">
          The Admin API endpoints aren't available for individual accounts. Subscription details
          will remain locked.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-green" />
          <span className="text-[12px] font-medium text-[var(--text-primary)]">
            Connected (Standard)
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-secondary)]">{updatedAgo}</span>
      </div>
      <Field label="API access" value="verified" />
      <Field label="Models available" value={String(models.length)} />
      <div className="rounded-md bg-[var(--bg-tertiary)] border border-[var(--border)] p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Lock size={13} className="text-accent-amber" />
          <span className="text-[12px] font-semibold text-[var(--text-primary)]">
            Unlock Full Dashboard
          </span>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)]">
          Add an Admin API key in Settings to see organization details, usage history, cost
          tracking, and spend limits.
        </p>
        <button
          onClick={onAddAdminKey}
          className="w-full h-7 rounded bg-accent-blue text-white text-[11px] font-medium hover:brightness-110"
        >
          Add Admin Key
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[11px] text-[var(--text-secondary)]">{label}</span>
      <span
        className={`text-[12px] text-[var(--text-primary)] truncate text-right ${mono ? 'font-mono text-[11px]' : ''}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
