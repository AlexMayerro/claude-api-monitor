import { useEffect } from 'react';
import { applyTheme, darkTheme, lightTheme } from '@renderer/lib/themes';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { FONT_SIZE_PX, FONT_FAMILY_STACKS } from '@renderer/lib/constants';

function resolveTheme(mode: 'dark' | 'light' | 'system'): 'dark' | 'light' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return mode;
}

export function useTheme(): void {
  const settings = useSettingsStore((s) => s.settings);
  const loaded = useSettingsStore((s) => s.loaded);

  useEffect(() => {
    if (!loaded) return;
    const resolved = resolveTheme(settings.theme);
    const palette = resolved === 'light' ? lightTheme : darkTheme;
    applyTheme(palette, settings.accent_color, settings.highlight_color);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.classList.toggle('light', resolved === 'light');
  }, [settings.theme, settings.accent_color, settings.highlight_color, loaded]);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.style.setProperty('--app-font-size', `${FONT_SIZE_PX[settings.font_size]}px`);
    document.documentElement.style.setProperty('--app-font-family', FONT_FAMILY_STACKS[settings.font_family]);
  }, [settings.font_size, settings.font_family, loaded]);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.classList.toggle('anim-reduced', settings.animation_speed === 'reduced');
    document.documentElement.classList.toggle('anim-none', settings.animation_speed === 'none');
  }, [settings.animation_speed, loaded]);

  useEffect(() => {
    if (!loaded) return;
    document.body.style.opacity = String(settings.window_opacity / 100);
  }, [settings.window_opacity, loaded]);
}
