import { X, ExternalLink } from 'lucide-react';
import { useApp } from '../store/appStore';
import { Toggle } from './Toggle';
import { updateSettings } from '../hooks/useSettings';
import { api } from '../utils/bridge';
import { URLS } from '../utils/constants';
import type { Theme, RefreshInterval, ProbeInterval } from '../../shared/types';
import { estimateCost } from '../utils/pricing';

const THEMES: { id: Theme; label: string }[] = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'system', label: 'System' },
];

const REFRESH_OPTIONS: { id: RefreshInterval; label: string }[] = [
  { id: 30, label: '30 seconds' },
  { id: 60, label: '1 minute' },
  { id: 120, label: '2 minutes' },
  { id: 300, label: '5 minutes' },
];

const PROBE_OPTIONS: { id: ProbeInterval; label: string }[] = [
  { id: 120, label: '2 minutes' },
  { id: 300, label: '5 minutes' },
  { id: 600, label: '10 minutes' },
  { id: 1800, label: '30 minutes' },
];

export function SettingsPanel({ onChangeKeys }: { onChangeKeys: () => void }) {
  const open = useApp((s) => s.showSettings);
  const close = () => useApp.getState().toggleSettingsPanel(false);
  const settings = useApp((s) => s.settings);
  const usageToday = useApp((s) => s.usageToday);

  if (!open || !settings) return null;

  const totalCostToday = usageToday.reduce(
    (acc, b) => acc + b.results.reduce((a, r) => a + estimateCost(r).total, 0),
    0,
  );

  const exportCsv = async () => {
    const rows = ['period,model,input_tokens,cache_read,cache_create,output_tokens,web_searches,est_cost'];
    for (const b of usageToday) {
      for (const r of b.results) {
        const cacheCreated =
          (r.cache_creation?.ephemeral_1h_input_tokens ?? 0) +
          (r.cache_creation?.ephemeral_5m_input_tokens ?? 0);
        rows.push(
          [
            `${b.starting_at}/${b.ending_at}`,
            r.model ?? '',
            r.uncached_input_tokens,
            r.cache_read_input_tokens,
            cacheCreated,
            r.output_tokens,
            r.server_tool_use?.web_search_requests ?? 0,
            estimateCost(r).total.toFixed(4),
          ].join(','),
        );
      }
    }
    await api().exportCsv(rows.join('\n'), `claude-monitor-usage-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const clearCache = () => {
    useApp.setState({
      models: [], modelsLoaded: false, org: undefined, orgUsers: [], workspaces: [],
      apiKeys: [], usageToday: [], usage7d: [], usage30d: [], costs7d: [], costs30d: [],
      rateLimits: undefined, lastUpdatedMs: 0, lastProbeMs: 0,
    });
  };

  return (
    <div className="absolute inset-0 z-30 flex">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={close}
      />
      <div className="relative ml-auto w-full bg-[var(--bg-primary)] flex flex-col animate-slide-in">
        <div className="flex items-center justify-between h-[40px] px-3 border-b border-[var(--border)]">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--text-primary)]">
            Settings
          </span>
          <button
            onClick={close}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollarea p-3 space-y-4">
          <Group title="Account">
            <button
              onClick={onChangeKeys}
              className="w-full h-8 rounded-md bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[11px] text-[var(--text-primary)]"
            >
              Change Keys
            </button>
            <button
              onClick={async () => { await api().clearKeys(); useApp.getState().setKeys({ hasApiKey: false, hasAdminKey: false }); useApp.getState().setReconnectScreen(true); close(); }}
              className="w-full h-8 rounded-md border border-accent-red/40 text-accent-red hover:bg-accent-red/10 text-[11px]"
            >
              Disconnect
            </button>
          </Group>

          <Group title="Display">
            <RowSelect
              label="Theme"
              options={THEMES.map((t) => ({ value: t.id, label: t.label }))}
              value={settings.theme}
              onChange={(v) => updateSettings({ theme: v as Theme })}
            />
            <RowToggle
              label="Always on Top"
              checked={settings.alwaysOnTop}
              onChange={(v) => { updateSettings({ alwaysOnTop: v }); api().windowSetTop(v); }}
            />
            <RowSlider
              label="Window Opacity"
              value={Math.round(settings.opacity * 100)}
              min={70}
              max={100}
              step={1}
              suffix="%"
              onChange={(v) => { const n = v / 100; updateSettings({ opacity: n }); api().windowSetOpacity(n); }}
            />
            <RowToggle
              label="Compact Mode"
              checked={settings.compactMode}
              onChange={(v) => updateSettings({ compactMode: v })}
            />
          </Group>

          <Group title="Behavior">
            <RowSelect
              label="Auto-refresh"
              options={REFRESH_OPTIONS.map((o) => ({ value: String(o.id), label: o.label }))}
              value={String(settings.refreshInterval)}
              onChange={(v) => updateSettings({ refreshInterval: Number(v) as RefreshInterval })}
            />
            <RowToggle
              label="Start with Windows"
              checked={settings.startWithWindows}
              onChange={(v) => updateSettings({ startWithWindows: v })}
            />
            <RowToggle
              label="Start Minimized to Tray"
              checked={settings.startMinimized}
              onChange={(v) => updateSettings({ startMinimized: v })}
            />
            <RowToggle
              label="Show Notifications"
              checked={settings.showNotifications}
              onChange={(v) => updateSettings({ showNotifications: v })}
            />
            <div>
              <RowSelect
                label="Rate Limit Probe"
                options={PROBE_OPTIONS.map((o) => ({ value: String(o.id), label: o.label }))}
                value={String(settings.probeInterval)}
                onChange={(v) => updateSettings({ probeInterval: Number(v) as ProbeInterval })}
              />
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                Each probe costs ~$0.00001 (Haiku). At 5 min intervals, this is ~$0.003/day.
              </p>
            </div>
          </Group>

          <Group title="Data & Privacy">
            <button
              onClick={clearCache}
              className="w-full h-8 rounded-md bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[11px] text-[var(--text-primary)]"
            >
              Clear Cached Data
            </button>
            <button
              onClick={exportCsv}
              className="w-full h-8 rounded-md bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[11px] text-[var(--text-primary)]"
            >
              Export Usage Data (today: {totalCostToday > 0 ? totalCostToday.toFixed(2) : '0.00'} USD)
            </button>
            <p className="text-[10px] text-[var(--text-secondary)]">
              API keys are encrypted on your device using Windows Credential Manager. They are never
              transmitted anywhere except to Anthropic's API.
            </p>
          </Group>

          <Group title="About">
            <div className="text-[12px] text-[var(--text-primary)] font-medium">Claude Monitor</div>
            <div className="text-[11px] text-[var(--text-secondary)]">Version 1.0.0</div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Built for Anthropic API monitoring
            </div>
            <ExternalLinkRow label="Anthropic API Docs" url={URLS.DOCS} />
            <ExternalLinkRow label="Claude Console" url={URLS.CONSOLE} />
            <ExternalLinkRow label="Report an Issue" url={URLS.ISSUES} />
          </Group>
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] p-3 space-y-2.5">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">
        {title}
      </div>
      {children}
    </div>
  );
}

function RowToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[var(--text-primary)]">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function RowSelect({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-[var(--text-primary)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded text-[11px] text-[var(--text-primary)] px-2 py-1 focus:outline-none focus:border-accent-blue"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function RowSlider({ label, value, min, max, step, suffix, onChange }: {
  label: string; value: number; min: number; max: number; step: number; suffix?: string; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-[var(--text-primary)] flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-1 max-w-[60%]">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-blue-400"
        />
        <span className="text-[11px] text-[var(--text-secondary)] w-10 text-right">{value}{suffix}</span>
      </div>
    </div>
  );
}

function ExternalLinkRow({ label, url }: { label: string; url: string }) {
  return (
    <button
      onClick={() => api().openExternal(url)}
      className="flex items-center gap-1.5 text-[11px] text-accent-blue hover:underline"
    >
      {label} <ExternalLink size={11} />
    </button>
  );
}
