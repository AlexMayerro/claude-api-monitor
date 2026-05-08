import { useEffect, useRef } from 'react';
import { useApp } from '../store/appStore';
import { fetchModels } from './useModels';
import { probeRateLimits } from './useRateLimits';
import { fetchUsageToday, fetchUsage7d, fetchUsage30d } from './useUsageData';
import { fetchCosts7d, fetchCosts30d } from './useCostData';
import {
  fetchOrgInfo,
  fetchOrgUsers,
  fetchWorkspaces,
  fetchApiKeys,
} from './useOrgData';

export async function refreshAll(opts: { probe?: boolean } = {}): Promise<void> {
  const state = useApp.getState();
  const tasks: Promise<unknown>[] = [];
  tasks.push(fetchModels().catch(() => undefined));
  if (opts.probe) tasks.push(probeRateLimits().catch(() => undefined));

  if (state.keys?.hasAdminKey) {
    tasks.push(fetchOrgInfo().catch(() => undefined));
    tasks.push(fetchOrgUsers().catch(() => undefined));
    tasks.push(fetchWorkspaces().catch(() => undefined));
    tasks.push(fetchApiKeys().catch(() => undefined));
    tasks.push(fetchUsageToday().catch(() => undefined));
    tasks.push(fetchUsage7d().catch(() => undefined));
    tasks.push(fetchUsage30d().catch(() => undefined));
    tasks.push(fetchCosts7d().catch(() => undefined));
    tasks.push(fetchCosts30d().catch(() => undefined));
  }
  await Promise.allSettled(tasks);
  state.touchUpdated();
}

export function useAutoRefresh(connected: boolean): void {
  const refreshInterval = useApp((s) => s.settings?.refreshInterval) ?? 60;
  const probeInterval = useApp((s) => s.settings?.probeInterval) ?? 300;
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const probeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!connected) return;
    refreshAll({ probe: true });
    refreshTimer.current = setInterval(() => {
      refreshAll();
    }, refreshInterval * 1000);
    probeTimer.current = setInterval(() => {
      probeRateLimits().catch(() => undefined);
    }, probeInterval * 1000);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      if (probeTimer.current) clearInterval(probeTimer.current);
    };
  }, [connected, refreshInterval, probeInterval]);
}
