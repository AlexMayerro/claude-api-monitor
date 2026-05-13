import React from 'react';
import { SectionHeader, SettingRow } from './SettingsView';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { Toggle } from '@renderer/components/common/Toggle';
import { Select } from '@renderer/components/common/Select';
import { Slider } from '@renderer/components/common/Slider';
import { Input } from '@renderer/components/common/Input';

export const AdvancedSettings: React.FC = () => {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  return (
    <div>
      <SectionHeader title="Advanced" description="Power-user options. Be deliberate." />
      <SettingRow label="API timeout (seconds)">
        <Slider
          value={settings.api_timeout}
          onChange={(v) => update('api_timeout', v)}
          min={15}
          max={120}
          step={5}
          formatValue={(v) => `${v}s`}
        />
      </SettingRow>
      <SettingRow label="Retry failed requests">
        <Toggle checked={settings.retry_failed} onChange={(v) => update('retry_failed', v)} />
      </SettingRow>
      <SettingRow label="Max retries">
        <Slider
          value={settings.max_retries}
          onChange={(v) => update('max_retries', v)}
          min={1}
          max={5}
          step={1}
        />
      </SettingRow>
      <SettingRow label="Debug mode">
        <Toggle checked={settings.debug_mode} onChange={(v) => update('debug_mode', v)} />
      </SettingRow>
      <SettingRow label="Log level">
        <Select
          value={settings.log_level}
          onChange={(v) => update('log_level', v as any)}
          options={[
            { value: 'errors', label: 'Errors only' },
            { value: 'warnings', label: 'Warnings' },
            { value: 'all', label: 'All' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Custom system prompt" description="Prepended to every chat (after the memory layer).">
        <textarea
          value={settings.custom_system_prompt}
          onChange={(e) => update('custom_system_prompt', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-md border border-border bg-surface-card text-text-primary text-[13px] outline-none focus:border-accent resize-y"
          placeholder="Additional instructions for Claude…"
        />
      </SettingRow>
      <SettingRow label="Proxy host">
        <Input value={settings.proxy_host} onChange={(e) => update('proxy_host', e.target.value)} placeholder="proxy.example.com" />
      </SettingRow>
      <SettingRow label="Proxy port">
        <Input value={settings.proxy_port} onChange={(e) => update('proxy_port', e.target.value)} placeholder="8080" inputMode="numeric" />
      </SettingRow>
      <SettingRow label="Hardware acceleration" description="Restart the app for this to take effect.">
        <Toggle checked={settings.hardware_acceleration} onChange={(v) => update('hardware_acceleration', v)} />
      </SettingRow>
    </div>
  );
};
