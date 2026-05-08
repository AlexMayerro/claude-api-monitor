import { ConnectionStatus } from './api/ConnectionStatus';
import { RateLimits } from './api/RateLimits';
import { AvailableModels } from './api/AvailableModels';
import { EndpointsReference } from './api/EndpointsReference';

export function ApiView() {
  return (
    <div className="space-y-3">
      <ConnectionStatus />
      <RateLimits />
      <AvailableModels />
      <EndpointsReference />
    </div>
  );
}
