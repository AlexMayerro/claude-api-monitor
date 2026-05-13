import React from 'react';
import { SectionHeader, SettingRow } from './SettingsView';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { Toggle } from '@renderer/components/common/Toggle';
import { Select } from '@renderer/components/common/Select';
import { Slider } from '@renderer/components/common/Slider';

export const NotificationSettings: React.FC = () => {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  return (
    <div>
      <SectionHeader title="Notifications" />
      <SettingRow label="Toast when memory is saved">
        <Toggle checked={settings.memory_saved_toast} onChange={(v) => update('memory_saved_toast', v)} />
      </SettingRow>
      <SettingRow label="Sound effects">
        <Toggle checked={settings.sound_effects} onChange={(v) => update('sound_effects', v)} />
      </SettingRow>
      <SettingRow label="Toast position">
        <Select
          value={settings.toast_position}
          onChange={(v) => update('toast_position', v as any)}
          options={[
            { value: 'top-right', label: 'Top-right' },
            { value: 'bottom-right', label: 'Bottom-right' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Toast duration">
        <Slider
          value={settings.toast_duration}
          onChange={(v) => update('toast_duration', v)}
          min={2}
          max={8}
          step={1}
          formatValue={(v) => `${v}s`}
        />
      </SettingRow>
      <SettingRow label="Memory count badge in sidebar">
        <Toggle checked={settings.memory_count_badge} onChange={(v) => update('memory_count_badge', v)} />
      </SettingRow>
    </div>
  );
};
