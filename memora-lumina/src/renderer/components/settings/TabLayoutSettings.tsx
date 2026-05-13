import React from 'react';
import { SectionHeader, SettingRow } from './SettingsView';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { Toggle } from '@renderer/components/common/Toggle';
import { Select } from '@renderer/components/common/Select';
import { Slider } from '@renderer/components/common/Slider';

export const TabLayoutSettings: React.FC = () => {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  return (
    <div>
      <SectionHeader title="Tabs & Layout" />
      <SettingRow label="Remember layout" description="Restore your tabs and split view between sessions.">
        <Toggle checked={settings.remember_layout} onChange={(v) => update('remember_layout', v)} />
      </SettingRow>
      <SettingRow label="Default split direction">
        <Select
          value={settings.default_split_direction}
          onChange={(v) => update('default_split_direction', v as any)}
          options={[
            { value: 'horizontal', label: 'Horizontal' },
            { value: 'vertical', label: 'Vertical' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Max open tabs">
        <Slider
          value={settings.max_open_tabs}
          onChange={(v) => update('max_open_tabs', v)}
          min={3}
          max={20}
          step={1}
        />
      </SettingRow>
      <SettingRow label="Confirm before closing a tab">
        <Toggle checked={settings.close_tab_confirmation} onChange={(v) => update('close_tab_confirmation', v)} />
      </SettingRow>
      <SettingRow label="Open Memory Stream on start">
        <Toggle checked={settings.open_memory_stream_on_start} onChange={(v) => update('open_memory_stream_on_start', v)} />
      </SettingRow>
    </div>
  );
};
