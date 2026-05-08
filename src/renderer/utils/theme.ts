import type { Theme } from '../../shared/types';

export function applyTheme(theme: Theme, systemPrefersDark: boolean): 'dark' | 'light' {
  const resolved =
    theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
  return resolved;
}

export function getSystemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
}
