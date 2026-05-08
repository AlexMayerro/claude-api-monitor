import { useApp } from '../store/appStore';
import { callApi } from './useAnthropicApi';
import { PROBE_BODY } from '../utils/constants';
import type { RateLimitHeaders } from '../utils/api-types';

function num(h: Record<string, string> | undefined, key: string): number | undefined {
  if (!h) return undefined;
  const v = h[key];
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function str(h: Record<string, string> | undefined, key: string): string | undefined {
  return h?.[key];
}

export async function probeRateLimits(): Promise<void> {
  const store = useApp.getState();
  const resp = await callApi<unknown>({
    method: 'POST',
    path: '/v1/messages',
    body: PROBE_BODY,
  });

  // We accept both 2xx and 429 — both yield rate-limit headers.
  const headers = resp.headers ?? {};
  const rl: RateLimitHeaders = {
    requestsLimit: num(headers, 'anthropic-ratelimit-requests-limit'),
    requestsRemaining: num(headers, 'anthropic-ratelimit-requests-remaining'),
    requestsReset: str(headers, 'anthropic-ratelimit-requests-reset'),
    inputLimit: num(headers, 'anthropic-ratelimit-input-tokens-limit'),
    inputRemaining: num(headers, 'anthropic-ratelimit-input-tokens-remaining'),
    inputReset: str(headers, 'anthropic-ratelimit-input-tokens-reset'),
    outputLimit: num(headers, 'anthropic-ratelimit-output-tokens-limit'),
    outputRemaining: num(headers, 'anthropic-ratelimit-output-tokens-remaining'),
    outputReset: str(headers, 'anthropic-ratelimit-output-tokens-reset'),
    tokensLimit: num(headers, 'anthropic-ratelimit-tokens-limit'),
    tokensRemaining: num(headers, 'anthropic-ratelimit-tokens-remaining'),
    tokensReset: str(headers, 'anthropic-ratelimit-tokens-reset'),
    retryAfter: num(headers, 'retry-after'),
    status: resp.status,
    capturedAt: Date.now(),
    latencyMs: resp.latencyMs,
  };

  // Always update connection status: any HTTP response (even 429) means we reached the API.
  if (resp.status > 0) {
    store.setApiStatus('connected');
  } else {
    store.setApiStatus('error', resp.error);
  }

  useApp.setState({ rateLimits: rl, lastProbeMs: Date.now() });
}
