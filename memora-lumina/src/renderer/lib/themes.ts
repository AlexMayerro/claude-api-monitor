export interface ThemePalette {
  '--bg-primary': string;
  '--bg-secondary': string;
  '--surface-card': string;
  '--surface-elevated': string;
  '--surface-active': string;
  '--border-default': string;
  '--border-subtle': string;
  '--border-focus': string;
  '--text-primary': string;
  '--text-secondary': string;
  '--text-muted': string;
  '--text-inverse': string;
  '--accent-primary': string;
  '--accent-hover': string;
  '--accent-subtle': string;
  '--success': string;
  '--success-bg': string;
  '--warning': string;
  '--warning-bg': string;
  '--error': string;
  '--error-bg': string;
  '--info': string;
  '--info-bg': string;
  '--dot-blue': string;
  '--dot-gold': string;
  '--dot-green': string;
  '--dot-purple': string;
  '--highlight-bg': string;
  '--highlight-text': string;
  '--shadow-card': string;
  '--shadow-elevated': string;
  '--shadow-modal': string;
  '--scrollbar-thumb': string;
}

export const darkTheme: ThemePalette = {
  '--bg-primary': '#0F1117',
  '--bg-secondary': '#151821',
  '--surface-card': '#1A1D27',
  '--surface-elevated': '#242836',
  '--surface-active': '#2E3348',
  '--border-default': '#2E3348',
  '--border-subtle': '#1F2233',
  '--border-focus': '#3B82F6',
  '--text-primary': '#F1F5F9',
  '--text-secondary': '#94A3B8',
  '--text-muted': '#64748B',
  '--text-inverse': '#0F1117',
  '--accent-primary': '#3B82F6',
  '--accent-hover': '#2563EB',
  '--accent-subtle': '#1E3A5F',
  '--success': '#22C55E',
  '--success-bg': 'rgba(20,83,45,0.12)',
  '--warning': '#F59E0B',
  '--warning-bg': 'rgba(113,52,7,0.12)',
  '--error': '#EF4444',
  '--error-bg': 'rgba(127,29,29,0.12)',
  '--info': '#06B6D4',
  '--info-bg': 'rgba(22,64,73,0.12)',
  '--dot-blue': '#3B82F6',
  '--dot-gold': '#F59E0B',
  '--dot-green': '#22C55E',
  '--dot-purple': '#8B5CF6',
  '--highlight-bg': 'rgba(251,191,36,0.25)',
  '--highlight-text': '#FBBF24',
  '--shadow-card': '0 1px 3px rgba(0,0,0,0.4)',
  '--shadow-elevated': '0 4px 12px rgba(0,0,0,0.5)',
  '--shadow-modal': '0 8px 32px rgba(0,0,0,0.6)',
  '--scrollbar-thumb': '#2E3348',
};

export const lightTheme: ThemePalette = {
  '--bg-primary': '#F8FAFC',
  '--bg-secondary': '#F1F5F9',
  '--surface-card': '#FFFFFF',
  '--surface-elevated': '#F8FAFC',
  '--surface-active': '#E2E8F0',
  '--border-default': '#E2E8F0',
  '--border-subtle': '#F1F5F9',
  '--border-focus': '#3B82F6',
  '--text-primary': '#0F172A',
  '--text-secondary': '#475569',
  '--text-muted': '#94A3B8',
  '--text-inverse': '#FFFFFF',
  '--accent-primary': '#3B82F6',
  '--accent-hover': '#2563EB',
  '--accent-subtle': '#DBEAFE',
  '--success': '#16A34A',
  '--success-bg': 'rgba(22,163,74,0.10)',
  '--warning': '#D97706',
  '--warning-bg': 'rgba(217,119,6,0.10)',
  '--error': '#DC2626',
  '--error-bg': 'rgba(220,38,38,0.10)',
  '--info': '#0891B2',
  '--info-bg': 'rgba(8,145,178,0.10)',
  '--dot-blue': '#3B82F6',
  '--dot-gold': '#D97706',
  '--dot-green': '#16A34A',
  '--dot-purple': '#7C3AED',
  '--highlight-bg': '#FEF08A',
  '--highlight-text': '#92400E',
  '--shadow-card': '0 1px 3px rgba(15,23,42,0.08)',
  '--shadow-elevated': '0 4px 12px rgba(15,23,42,0.10)',
  '--shadow-modal': '0 8px 32px rgba(15,23,42,0.15)',
  '--scrollbar-thumb': '#CBD5E1',
};

export function applyTheme(palette: ThemePalette, accentOverride?: string, highlightOverride?: string): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(palette)) {
    root.style.setProperty(key, value);
  }
  if (accentOverride) {
    root.style.setProperty('--accent-primary', accentOverride);
    root.style.setProperty('--border-focus', accentOverride);
    root.style.setProperty('--accent-hover', shadeHex(accentOverride, -10));
    root.style.setProperty('--accent-subtle', shadeHex(accentOverride, -55, 0.18));
  }
  if (highlightOverride) {
    root.style.setProperty('--highlight-bg', shadeHex(highlightOverride, 0, 0.25));
    root.style.setProperty('--highlight-text', highlightOverride);
  }
}

function shadeHex(hex: string, percent: number, alpha?: number): string {
  const c = hex.replace('#', '');
  const num = parseInt(c, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, r + Math.round((percent / 100) * 255)));
  g = Math.max(0, Math.min(255, g + Math.round((percent / 100) * 255)));
  b = Math.max(0, Math.min(255, b + Math.round((percent / 100) * 255)));
  if (alpha !== undefined) return `rgba(${r},${g},${b},${alpha})`;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export const ACCENT_PRESETS = [
  { name: 'Lumina Blue', value: '#3B82F6' },
  { name: 'Royal Purple', value: '#8B5CF6' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Indigo', value: '#6366F1' },
];
