import { familyOf } from './constants';
import type { UsageBucketResult } from './api-types';

export interface PricingTier {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

// All prices per 1M tokens.
export const PRICING: Record<string, PricingTier> = {
  'claude-opus-4': { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 },
  'claude-sonnet-4': { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  'claude-haiku-4': { input: 0.8, output: 4, cacheRead: 0.08, cacheWrite: 1 },
};

export const WEB_SEARCH_PER_THOUSAND = 10; // USD per 1000 searches

export function pricingFor(modelId: string | null | undefined): PricingTier | null {
  if (!modelId) return null;
  const id = modelId.toLowerCase();
  for (const key of Object.keys(PRICING)) {
    if (id.startsWith(key)) return PRICING[key];
  }
  const fam = familyOf(modelId);
  if (fam === 'opus') return PRICING['claude-opus-4'];
  if (fam === 'sonnet') return PRICING['claude-sonnet-4'];
  if (fam === 'haiku') return PRICING['claude-haiku-4'];
  return null;
}

export interface CostBreakdown {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  webSearch: number;
  total: number;
}

export function estimateCost(r: UsageBucketResult): CostBreakdown {
  const p = pricingFor(r.model) ?? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  const cacheCreated =
    (r.cache_creation?.ephemeral_1h_input_tokens ?? 0) +
    (r.cache_creation?.ephemeral_5m_input_tokens ?? 0);
  const input = (r.uncached_input_tokens / 1_000_000) * p.input;
  const output = (r.output_tokens / 1_000_000) * p.output;
  const cacheRead = (r.cache_read_input_tokens / 1_000_000) * p.cacheRead;
  const cacheWrite = (cacheCreated / 1_000_000) * p.cacheWrite;
  const webSearch = ((r.server_tool_use?.web_search_requests ?? 0) / 1000) * WEB_SEARCH_PER_THOUSAND;
  const total = input + output + cacheRead + cacheWrite + webSearch;
  return { input, output, cacheRead, cacheWrite, webSearch, total };
}
