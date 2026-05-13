import React from 'react';
import { SectionHeader, SettingRow } from './SettingsView';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { Toggle } from '@renderer/components/common/Toggle';
import { Slider } from '@renderer/components/common/Slider';
import { Select } from '@renderer/components/common/Select';
import { ColorPicker } from '@renderer/components/common/ColorPicker';

const HIGHLIGHT_PRESETS = [
  { name: 'Amber', value: '#FBBF24' },
  { name: 'Yellow', value: '#FACC15' },
  { name: 'Mint', value: '#10B981' },
  { name: 'Sky', value: '#38BDF8' },
  { name: 'Rose', value: '#FB7185' },
];

export const MemoryStreamSettings: React.FC = () => {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  return (
    <div>
      <SectionHeader title="Memory Stream" description="The live keyword-searchable feed of everything I remember." />
      <SettingRow label="Highlight color" description="Used for search keyword matches.">
        <ColorPicker
          value={settings.highlight_color}
          onChange={(v) => update('highlight_color', v)}
          presets={HIGHLIGHT_PRESETS}
        />
      </SettingRow>
      <SettingRow label="Auto-jump sensitivity" description="How aggressively the stream jumps to relevant memories while chatting.">
        <Select
          value={settings.auto_jump_sensitivity}
          onChange={(v) => update('auto_jump_sensitivity', v as any)}
          options={[
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
            { value: 'off', label: 'Off' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Default sort">
        <Select
          value={settings.stream_default_sort}
          onChange={(v) => update('stream_default_sort', v as any)}
          options={[
            { value: 'newest', label: 'Newest first' },
            { value: 'oldest', label: 'Oldest first' },
            { value: 'importance', label: 'By importance' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Show importance dots">
        <Toggle checked={settings.show_importance_dots} onChange={(v) => update('show_importance_dots', v)} />
      </SettingRow>
      <SettingRow label="Show layer badges">
        <Toggle checked={settings.show_layer_badges} onChange={(v) => update('show_layer_badges', v)} />
      </SettingRow>
      <SettingRow label="Default time range">
        <Select
          value={settings.stream_default_range}
          onChange={(v) => update('stream_default_range', v as any)}
          options={[
            { value: 'all', label: 'All time' },
            { value: '30d', label: 'Last 30 days' },
            { value: '7d', label: 'Last 7 days' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Stream font size">
        <Slider
          value={settings.stream_font_size}
          onChange={(v) => update('stream_font_size', v)}
          min={12}
          max={18}
          step={1}
          formatValue={(v) => `${v}px`}
        />
      </SettingRow>
    </div>
  );
};
