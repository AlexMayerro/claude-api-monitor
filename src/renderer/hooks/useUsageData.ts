import { useApp } from '../store/appStore';
import { callApi } from './useAnthropicApi';
import type { UsageReport, UsageBucket } from '../utils/api-types';
import { startOfTodayUtcIso, daysAgoUtcIso, nowIso } from '../utils/formatters';

const MAX_PAGES = 20;

async function fetchAllUsage(query: Record<string, string | string[]>): Promise<{ buckets: UsageBucket[]; partial: boolean }> {
  let collected: UsageBucket[] = [];
  let nextPage: string | null = null;
  let partial = false;

  for (let i = 0; i < MAX_PAGES; i++) {
    const q: Record<string, string | string[]> = { ...query };
    if (nextPage) q.page = nextPage;
    const resp = await callApi<UsageReport>({
      method: 'GET',
      path: '/v1/organizations/usage_report/messages',
      query: q,
      useAdmin: true,
    });
    if (!resp.ok || !resp.data) {
      partial = collected.length > 0;
      break;
    }
    collected = collected.concat(resp.data.data ?? []);
    if (!resp.data.has_more || !resp.data.next_page) break;
    nextPage = resp.data.next_page;
    if (i === MAX_PAGES - 1) partial = true;
  }
  return { buckets: collected, partial };
}

export async function fetchUsageToday(): Promise<void> {
  const { buckets, partial } = await fetchAllUsage({
    starting_at: startOfTodayUtcIso(),
    ending_at: nowIso(),
    bucket_width: '1h',
    'group_by[]': ['model'],
  });
  useApp.setState({ usageToday: buckets, partialData: partial });
}

export async function fetchUsage7d(): Promise<void> {
  const { buckets, partial } = await fetchAllUsage({
    starting_at: daysAgoUtcIso(7),
    ending_at: nowIso(),
    bucket_width: '1d',
    'group_by[]': ['model'],
  });
  useApp.setState({ usage7d: buckets });
  if (partial) useApp.setState({ partialData: true });
}

export async function fetchUsage30d(): Promise<void> {
  const { buckets, partial } = await fetchAllUsage({
    starting_at: daysAgoUtcIso(30),
    ending_at: nowIso(),
    bucket_width: '1d',
    'group_by[]': ['model'],
  });
  useApp.setState({ usage30d: buckets });
  if (partial) useApp.setState({ partialData: true });
}
