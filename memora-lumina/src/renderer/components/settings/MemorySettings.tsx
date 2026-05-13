import React from 'react';
import { SectionHeader, SettingRow } from './SettingsView';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { Toggle } from '@renderer/components/common/Toggle';
import { Slider } from '@renderer/components/common/Slider';
import { Select } from '@renderer/components/common/Select';

export const MemorySettings: React.FC = () => {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);

  return (
    <div>
      <SectionHeader title="Memory" description="Control how the memory layer thinks." />
      <SettingRow label="Auto-capture memories" description="Extract memories automatically after each AI response.">
        <Toggle checked={settings.auto_capture_memories} onChange={(v) => update('auto_capture_memories', v)} />
      </SettingRow>
      <SettingRow label="Importance threshold" description="Only save memories scored at or above this level (1–10).">
        <Slider
          value={settings.importance_threshold}
          onChange={(v) => update('importance_threshold', v)}
          min={1}
          max={10}
          step={1}
        />
      </SettingRow>
      <SettingRow label="Context injection" description="Inject relevant memories into Claude's context before sending.">
        <Toggle checked={settings.context_injection} onChange={(v) => update('context_injection', v)} />
      </SettingRow>
      <SettingRow label="Max injected memories" description="How many memories to pull in per message.">
        <Slider
          value={settings.max_injected_memories}
          onChange={(v) => update('max_injected_memories', v)}
          min={1}
          max={15}
          step={1}
        />
      </SettingRow>
      <SettingRow label="Max injection tokens">
        <Slider
          value={settings.max_injection_tokens}
          onChange={(v) => update('max_injection_tokens', v)}
          min={200}
          max={2000}
          step={50}
        />
      </SettingRow>
      <SettingRow label="Show memory indicators" description="Subtle indicator below AI responses showing memories used.">
        <Toggle checked={settings.show_memory_indicators} onChange={(v) => update('show_memory_indicators', v)} />
      </SettingRow>
      <SettingRow label="Auto-consolidation" description="When to promote/demote memories between layers.">
        <Select
          value={settings.auto_consolidation}
          onChange={(v) => update('auto_consolidation', v as any)}
          options={[
            { value: 'every_chat', label: 'After every chat' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'manual', label: 'Manual only' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Memory export format">
        <Select
          value={settings.memory_export_format}
          onChange={(v) => update('memory_export_format', v as any)}
          options={[
            { value: 'json', label: 'JSON' },
            { value: 'markdown', label: 'Markdown' },
            { value: 'plain', label: 'Plain text' },
          ]}
        />
      </SettingRow>
    </div>
  );
};
