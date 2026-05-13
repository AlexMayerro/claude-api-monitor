import React from 'react';
import { SectionHeader, SettingRow } from './SettingsView';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { Select } from '@renderer/components/common/Select';
import { Toggle } from '@renderer/components/common/Toggle';
import { Slider } from '@renderer/components/common/Slider';
import { AVAILABLE_MODELS } from '@shared/types';

export const ChatSettings: React.FC = () => {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);

  return (
    <div>
      <SectionHeader title="Chat" description="Tune how Claude responds and how messages flow." />
      <SettingRow label="Default model">
        <Select
          value={settings.default_model}
          onChange={(v) => update('default_model', v)}
          options={AVAILABLE_MODELS.map((m) => ({ value: m.id, label: m.name }))}
        />
      </SettingRow>
      <SettingRow label="Temperature" description="Higher = more creative. Lower = more deterministic.">
        <Slider
          value={settings.temperature}
          onChange={(v) => update('temperature', v)}
          min={0}
          max={1}
          step={0.05}
          formatValue={(v) => v.toFixed(2)}
        />
      </SettingRow>
      <SettingRow label="Max response length">
        <Select
          value={settings.max_response_length}
          onChange={(v) => update('max_response_length', v as any)}
          options={[
            { value: 'short', label: 'Short (1024)' },
            { value: 'medium', label: 'Medium (4096)' },
            { value: 'long', label: 'Long (8192)' },
            { value: 'max', label: 'Max (16384)' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Streaming">
        <Toggle checked={settings.streaming} onChange={(v) => update('streaming', v)} />
      </SettingRow>
      <SettingRow label="Send shortcut">
        <Select
          value={settings.send_shortcut}
          onChange={(v) => update('send_shortcut', v as any)}
          options={[
            { value: 'enter', label: 'Enter' },
            { value: 'ctrl_enter', label: 'Ctrl + Enter' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Auto-scroll to bottom">
        <Toggle checked={settings.auto_scroll} onChange={(v) => update('auto_scroll', v)} />
      </SettingRow>
      <SettingRow label="Always show timestamps">
        <Toggle checked={settings.show_timestamps} onChange={(v) => update('show_timestamps', v)} />
      </SettingRow>
      <SettingRow label="Timestamp format">
        <Select
          value={settings.timestamp_format}
          onChange={(v) => update('timestamp_format', v as any)}
          options={[
            { value: '12h', label: '12-hour' },
            { value: '24h', label: '24-hour' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Code block theme">
        <Select
          value={settings.code_theme}
          onChange={(v) => update('code_theme', v as any)}
          options={[
            { value: 'github-dark', label: 'GitHub Dark' },
            { value: 'monokai', label: 'Monokai' },
            { value: 'one-dark', label: 'One Dark' },
            { value: 'dracula', label: 'Dracula' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Show token count">
        <Toggle checked={settings.show_token_count} onChange={(v) => update('show_token_count', v)} />
      </SettingRow>
    </div>
  );
};
