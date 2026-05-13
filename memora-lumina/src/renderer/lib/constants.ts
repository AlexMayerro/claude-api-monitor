export const APP_NAME = 'Memora Lumina';
export const APP_TAGLINE = 'The AI that truly knows you.';

export const FONT_SIZE_PX: Record<'small' | 'medium' | 'large' | 'xl', number> = {
  small: 13,
  medium: 14,
  large: 15,
  xl: 16,
};

export const FONT_FAMILY_STACKS = {
  inter: "'Inter', system-ui, -apple-system, sans-serif",
  system: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
};

export const MESSAGE_DENSITY_PX = {
  compact: { vertical: 8, gap: 8 },
  comfortable: { vertical: 14, gap: 14 },
  spacious: { vertical: 20, gap: 20 },
};

export const PRIMARY_USE_OPTIONS = [
  'Coding',
  'Creative Work',
  'Personal Assistant',
  'Research',
  'Business',
  'General',
];

export const LAYER_LABEL: Record<string, string> = {
  core_identity: 'Core',
  long_term: 'Long-Term',
  mid_term: 'Mid-Term',
  short_term: 'Session',
};

export const LAYER_DOT_COLOR_VAR: Record<string, string> = {
  core_identity: 'var(--dot-purple)',
  long_term: 'var(--dot-gold)',
  mid_term: 'var(--dot-blue)',
  short_term: 'var(--dot-green)',
};
