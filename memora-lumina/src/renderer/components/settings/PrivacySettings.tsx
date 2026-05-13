import React, { useState } from 'react';
import { Trash2, Download, Upload, AlertTriangle } from 'lucide-react';
import { SectionHeader, SettingRow } from './SettingsView';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { useMemoryStore } from '@renderer/stores/useMemoryStore';
import { useAppStore } from '@renderer/stores/useAppStore';
import { Toggle } from '@renderer/components/common/Toggle';
import { Select } from '@renderer/components/common/Select';
import { Button } from '@renderer/components/common/Button';
import { Modal } from '@renderer/components/common/Modal';
import { Input } from '@renderer/components/common/Input';

export const PrivacySettings: React.FC = () => {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const showToast = useAppStore((s) => s.showToast);
  const loadMemories = useMemoryStore((s) => s.loadMemories);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const exportNow = async () => {
    const result = await window.memora.exportMemories(settings.memory_export_format);
    if (result) showToast(`Memories exported to ${result.path}`, 4000);
  };

  const importNow = async () => {
    const result = await window.memora.importMemories();
    if (result) {
      showToast(`Imported ${result.imported} memories`, 4000);
      await loadMemories();
    }
  };

  const clearAll = async () => {
    await window.memora.clearAllMemories();
    await loadMemories();
    setConfirmingClear(false);
    showToast('All memories cleared.', 3000);
  };

  return (
    <div>
      <SectionHeader title="Privacy & Data" />
      <SettingRow label="Auto-lock" description="Lock the app after a period of inactivity (UI-only).">
        <Select
          value={settings.auto_lock}
          onChange={(v) => update('auto_lock', v as any)}
          options={[
            { value: 'never', label: 'Never' },
            { value: '5m', label: 'After 5 min' },
            { value: '15m', label: 'After 15 min' },
            { value: '30m', label: 'After 30 min' },
            { value: '1h', label: 'After 1 hour' },
          ]}
        />
      </SettingRow>
      <SettingRow label="Require password to unlock">
        <Toggle checked={settings.require_password} onChange={(v) => update('require_password', v)} />
      </SettingRow>
      <SettingRow label="Anthropic API key" description="Stored locally only — never transmitted except to Anthropic.">
        <Input
          type={settings.api_key_display === 'show' ? 'text' : 'password'}
          value={settings.api_key}
          onChange={(e) => update('api_key', e.target.value)}
          placeholder="sk-ant-..."
          className="w-full"
          suffix={
            <button
              onClick={() => update('api_key_display', settings.api_key_display === 'show' ? 'hide' : 'show')}
              className="text-text-muted hover:text-text-primary text-[11px]"
            >
              {settings.api_key_display === 'show' ? 'Hide' : 'Show'}
            </button>
          }
        />
      </SettingRow>
      <SettingRow label="Export all data">
        <Button variant="secondary" onClick={exportNow}>
          <Download size={14} /> Export
        </Button>
      </SettingRow>
      <SettingRow label="Import backup">
        <Button variant="secondary" onClick={importNow}>
          <Upload size={14} /> Import
        </Button>
      </SettingRow>
      <SettingRow label="Clear all memories" description="This cannot be undone.">
        <Button variant="danger" onClick={() => setConfirmingClear(true)}>
          <Trash2 size={14} /> Clear all
        </Button>
      </SettingRow>

      <Modal
        open={confirmingClear}
        onClose={() => setConfirmingClear(false)}
        title="Clear all memories?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmingClear(false)}>Cancel</Button>
            <Button variant="danger" onClick={clearAll}>
              <Trash2 size={14} /> Yes, clear all
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 text-[13.5px] text-text-secondary">
          <AlertTriangle size={20} className="text-warning flex-shrink-0 mt-0.5" />
          This will permanently delete every memory across every layer. Your conversations will be kept.
        </div>
      </Modal>
    </div>
  );
};
