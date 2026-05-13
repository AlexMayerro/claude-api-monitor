import React from 'react';
import { SectionHeader, SettingRow } from './SettingsView';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { Select } from '@renderer/components/common/Select';
import { Slider } from '@renderer/components/common/Slider';
import { ColorPicker } from '@renderer/components/common/ColorPicker';
import { ACCENT_PRESETS } from '@renderer/lib/themes';

export const AppearanceSettings: React.FC = () => {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);

  return (
    <div>
      <SectionHeader title="Appearance" description="Personalize how Memora Lumina looks." />
      <SettingRow label="Theme" description="Switch between dark, light, or follow your system.">
        <Select
          value={settings.theme}
          onChange={(v) => update('theme', v as any)}
          options={[
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
            { value: 'system', label: 'System' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Accent color" description="Used across buttons, links, and active states.">
        <ColorPicker value={settings.accent_color} onChange={(v) => update('accent_color', v)} presets={ACCENT_PRESETS} />
      </SettingRow>
      <SettingRow label="Font size">
        <Select
          value={settings.font_size}
          onChange={(v) => update('font_size', v as any)}
          options={[
            { value: 'small', label: 'Small (13px)' },
            { value: 'medium', label: 'Medium (14px)' },
            { value: 'large', label: 'Large (15px)' },
            { value: 'xl', label: 'Extra Large (16px)' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Font family">
        <Select
          value={settings.font_family}
          onChange={(v) => update('font_family', v as any)}
          options={[
            { value: 'inter', label: 'Inter' },
            { value: 'system', label: 'System default' },
            { value: 'mono', label: 'Monospace' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Chat bubble style">
        <Select
          value={settings.chat_bubble_style}
          onChange={(v) => update('chat_bubble_style', v as any)}
          options={[
            { value: 'bubbles', label: 'Bubbles' },
            { value: 'flat', label: 'Flat' },
            { value: 'minimal', label: 'Minimal' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Message density">
        <Select
          value={settings.message_density}
          onChange={(v) => update('message_density', v as any)}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'spacious', label: 'Spacious' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Sidebar position">
        <Select
          value={settings.sidebar_position}
          onChange={(v) => update('sidebar_position', v as any)}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Sidebar width">
        <Slider
          value={settings.sidebar_width}
          onChange={(v) => update('sidebar_width', v)}
          min={200}
          max={400}
          step={10}
          formatValue={(v) => `${v}px`}
        />
      </SettingRow>
      <SettingRow label="Animation speed">
        <Select
          value={settings.animation_speed}
          onChange={(v) => update('animation_speed', v as any)}
          options={[
            { value: 'full', label: 'Full' },
            { value: 'reduced', label: 'Reduced' },
            { value: 'none', label: 'None' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Window opacity">
        <Slider
          value={settings.window_opacity}
          onChange={(v) => update('window_opacity', v)}
          min={80}
          max={100}
          step={1}
          formatValue={(v) => `${v}%`}
        />
      </SettingRow>
    </div>
  );
};
