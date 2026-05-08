import { AccountOverview } from './subscription/AccountOverview';
import { SpendCosts } from './subscription/SpendCosts';
import { UsageHistory } from './subscription/UsageHistory';
import { TeamMembers } from './subscription/TeamMembers';
import { Workspaces } from './subscription/Workspaces';
import { ApiKeysOverview } from './subscription/ApiKeysOverview';

export function SubscriptionView({ onAddAdminKey }: { onAddAdminKey: () => void }) {
  return (
    <div className="space-y-3">
      <AccountOverview onAddAdminKey={onAddAdminKey} />
      <SpendCosts onAddAdminKey={onAddAdminKey} />
      <UsageHistory onAddAdminKey={onAddAdminKey} />
      <TeamMembers onAddAdminKey={onAddAdminKey} />
      <Workspaces onAddAdminKey={onAddAdminKey} />
      <ApiKeysOverview onAddAdminKey={onAddAdminKey} />
    </div>
  );
}
