import { useApp } from '../store/appStore';
import { callApi } from './useAnthropicApi';
import type { CostReport, CostBucket } from '../utils/api-types';
import { daysAgoUtcIso, nowIso } from '../utils/formatters';

const MAX_PAGES = 20;

async function fetchAllCosts(query: Record<string, string | string[]>): Promise<CostBucket[]> {
  let collected: CostBucket[] = [];
  let nextPage: string | null = null;
  for (let i = 0; i < MAX_PAGES; i++) {
    const q: Record<string, string | string[]> = { ...query };
    if (nextPage) q.page = nextPage;
    const resp = await callApi<CostReport>({
      method: 'GET',
      path: '/v1/organizations/cost_report',
      query: q,
      useAdmin: true,
    });
    if (!resp.ok || !resp.data) break;
    collected = collected.concat(resp.data.data ?? []);
    if (!resp.data.has_more || !resp.data.next_page) break;
    nextPage = resp.data.next_page;
  }
  return collected;
}

export async function fetchCosts7d(): Promise<void> {
  const buckets = await fetchAllCosts({
    starting_at: daysAgoUtcIso(7),
    ending_at: nowIso(),
    bucket_width: '1d',
    'group_by[]': ['description'],
  });
  useApp.setState({ costs7d: buckets });
}

export async function fetchCosts30d(): Promise<void> {
  const buckets = await fetchAllCosts({
    starting_at: daysAgoUtcIso(30),
    ending_at: nowIso(),
    bucket_width: '1d',
    'group_by[]': ['description'],
  });
  useApp.setState({ costs30d: buckets });
}
