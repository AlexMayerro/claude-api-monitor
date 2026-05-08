export interface ModelCapabilities {
  batch?: { supported: boolean };
  citations?: { supported: boolean };
  code_execution?: { supported: boolean };
  thinking?: {
    supported: boolean;
    types?: {
      adaptive?: { supported: boolean };
      enabled?: { supported: boolean };
    };
  };
  image_input?: { supported: boolean };
  pdf_input?: { supported: boolean };
  structured_outputs?: { supported: boolean };
  effort?: {
    supported: boolean;
    low?: { supported: boolean };
    medium?: { supported: boolean };
    high?: { supported: boolean };
    max?: { supported: boolean };
    xhigh?: { supported: boolean };
  };
  context_management?: { supported: boolean };
}

export interface ModelInfo {
  id: string;
  display_name: string;
  created_at: string;
  max_input_tokens: number;
  max_tokens: number;
  type: 'model';
  capabilities?: ModelCapabilities;
}

export interface ModelsResponse {
  data: ModelInfo[];
  has_more: boolean;
  first_id?: string;
  last_id?: string;
}

export interface OrgInfo {
  id: string;
  type: 'organization';
  name: string;
  account_type?: string;
  usage_tier?: string;
  monthly_spend_limit?: number;
  max_credit_purchase?: number;
}

export interface OrgUser {
  id: string;
  type?: string;
  email?: string;
  name?: string;
  role: string;
  added_at?: string;
}

export interface OrgUsersResponse {
  data: OrgUser[];
  has_more: boolean;
  first_id?: string;
  last_id?: string;
}

export interface Workspace {
  id: string;
  type?: string;
  name: string;
  created_at?: string;
  archived_at?: string | null;
  display_color?: string;
}

export interface WorkspacesResponse {
  data: Workspace[];
  has_more: boolean;
}

export interface ApiKeyEntry {
  id: string;
  type?: string;
  name: string;
  status: 'active' | 'inactive' | string;
  workspace_id?: string | null;
  created_at?: string;
  partial_key_hint?: string;
}

export interface ApiKeysResponse {
  data: ApiKeyEntry[];
  has_more: boolean;
}

export interface UsageBucketResult {
  model: string | null;
  uncached_input_tokens: number;
  cache_read_input_tokens: number;
  cache_creation: {
    ephemeral_1h_input_tokens: number;
    ephemeral_5m_input_tokens: number;
  };
  output_tokens: number;
  server_tool_use: {
    web_search_requests: number;
  };
  service_tier: string | null;
  workspace_id: string | null;
  api_key_id: string | null;
}

export interface UsageBucket {
  starting_at: string;
  ending_at: string;
  results: UsageBucketResult[];
}

export interface UsageReport {
  data: UsageBucket[];
  has_more: boolean;
  next_page: string | null;
}

export interface CostBucketResult {
  amount: number;
  currency: string;
  description?: string | null;
  context_window?: string | null;
  model?: string | null;
  service_tier?: string | null;
  token_type?: string | null;
}

export interface CostBucket {
  starting_at: string;
  ending_at: string;
  results: CostBucketResult[];
}

export interface CostReport {
  data: CostBucket[];
  has_more: boolean;
  next_page: string | null;
}

export interface RateLimitHeaders {
  requestsLimit?: number;
  requestsRemaining?: number;
  requestsReset?: string;
  inputLimit?: number;
  inputRemaining?: number;
  inputReset?: string;
  outputLimit?: number;
  outputRemaining?: number;
  outputReset?: string;
  tokensLimit?: number;
  tokensRemaining?: number;
  tokensReset?: string;
  retryAfter?: number;
  status?: number;
  capturedAt: number;
  latencyMs?: number;
}
