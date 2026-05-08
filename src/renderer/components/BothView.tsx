import { SubscriptionView } from './SubscriptionView';
import { ApiView } from './ApiView';

export function BothView({ onAddAdminKey }: { onAddAdminKey: () => void }) {
  return (
    <div className="space-y-4">
      <SectionLabel>Subscription</SectionLabel>
      <SubscriptionView onAddAdminKey={onAddAdminKey} />
      <div className="py-3">
        <div className="divider-fade" />
      </div>
      <SectionLabel>API</SectionLabel>
      <ApiView />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--text-secondary)]">
      {children}
    </div>
  );
}
