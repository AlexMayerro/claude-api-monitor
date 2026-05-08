export const MODEL_FAMILIES = ['opus', 'sonnet', 'haiku'] as const;
export type ModelFamily = (typeof MODEL_FAMILIES)[number];

export const FAMILY_COLORS: Record<ModelFamily, string> = {
  opus: '#A78BFA',
  sonnet: '#FB923C',
  haiku: '#2DD4BF',
};

export const FAMILY_LABELS: Record<ModelFamily, string> = {
  opus: 'Claude Opus',
  sonnet: 'Claude Sonnet',
  haiku: 'Claude Haiku',
};

export function familyOf(modelId: string | null | undefined): ModelFamily | null {
  if (!modelId) return null;
  const id = modelId.toLowerCase();
  if (id.includes('opus')) return 'opus';
  if (id.includes('sonnet')) return 'sonnet';
  if (id.includes('haiku')) return 'haiku';
  return null;
}

export const PROBE_MODEL = 'claude-haiku-4-5-20251001';
export const PROBE_BODY = {
  model: PROBE_MODEL,
  max_tokens: 1,
  messages: [{ role: 'user' as const, content: 'hi' }],
};

export const URLS = {
  CONSOLE_KEYS: 'https://console.anthropic.com/settings/keys',
  CONSOLE_ADMIN_KEYS: 'https://console.anthropic.com/settings/admin-keys',
  CONSOLE: 'https://console.anthropic.com',
  DOCS: 'https://docs.anthropic.com',
  ISSUES: 'https://github.com/AlexMayerro/claude-api-monitor/issues',
};
