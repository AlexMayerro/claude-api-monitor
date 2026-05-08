import { useState } from 'react';
import { Eye, EyeOff, ExternalLink, Check, Loader2 } from 'lucide-react';
import { api } from '../utils/bridge';
import { URLS } from '../utils/constants';
import { useApp } from '../store/appStore';

interface Props {
  initialApiKey?: string;
  initialAdminKey?: string;
  onConnected: () => void;
  onCancel?: () => void;
}

function looksLikeApiKey(k: string): boolean {
  return /^sk-ant-(api|admin)/.test(k.trim());
}

export function ConnectAccount({ initialApiKey, initialAdminKey, onConnected, onCancel }: Props) {
  const [apiKey, setApiKey] = useState(initialApiKey ?? '');
  const [adminKey, setAdminKey] = useState(initialAdminKey ?? '');
  const [showApi, setShowApi] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  const setKeys = useApp((s) => s.setKeys);

  const onConnect = async () => {
    setApiError(null);
    setAdminError(null);
    const trimmedApi = apiKey.trim();
    const trimmedAdmin = adminKey.trim();

    if (!trimmedApi) {
      setApiError('API key is required');
      return;
    }
    if (!trimmedApi.startsWith('sk-ant-api')) {
      setApiError('Invalid key format — must start with sk-ant-api');
      return;
    }
    if (trimmedAdmin && !trimmedAdmin.startsWith('sk-ant-admin')) {
      setAdminError('Invalid key format — must start with sk-ant-admin');
      return;
    }

    setBusy(true);
    try {
      const result = await api().testKeys(trimmedApi, trimmedAdmin || undefined);
      if (!result.apiOk) {
        setApiError(result.apiError || 'Invalid key');
        setBusy(false);
        return;
      }
      if (trimmedAdmin && result.adminOk === false) {
        setAdminError(result.adminError || 'Admin key invalid');
        setBusy(false);
        return;
      }
      const stored = await api().storeKeys(trimmedApi, trimmedAdmin || undefined);
      setKeys(stored);
      setSuccess(true);
      setTimeout(() => {
        onConnected();
      }, 600);
    } catch (e) {
      setApiError((e as Error).message || 'Connection failed');
      setBusy(false);
    }
  };

  const openExternal = (url: string) => api().openExternal(url);

  return (
    <div className="flex-1 overflow-y-auto scrollarea px-5 py-6 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-4">
          <div className="text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">
            Anthropic
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 shadow-sm">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] text-center mb-1">
            Connect Your Anthropic Account
          </h2>
          <p className="text-[11px] text-[var(--text-secondary)] text-center mb-4">
            To get started, you'll need an API key from your Anthropic Console.
          </p>

          <KeyField
            label="API Key"
            value={apiKey}
            onChange={setApiKey}
            placeholder="sk-ant-api-..."
            visible={showApi}
            onToggle={() => setShowApi((v) => !v)}
            error={apiError}
          />

          <button
            onClick={() => openExternal(URLS.CONSOLE_KEYS)}
            className="text-[11px] text-accent-blue hover:underline inline-flex items-center gap-1 mt-2"
          >
            Don't have one? Get your API key
            <ExternalLink size={11} />
          </button>

          <button
            onClick={onConnect}
            disabled={busy}
            className="w-full mt-4 h-9 rounded-md font-medium text-white text-[12px] bg-accent-blue hover:brightness-110 disabled:opacity-60 transition flex items-center justify-center gap-2"
            style={{ background: success ? '#4ADE80' : '#6C8CFF' }}
          >
            {busy ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Testing…
              </>
            ) : success ? (
              <>
                <Check size={14} /> Connected
              </>
            ) : (
              'Test & Connect'
            )}
          </button>

          <div className="my-5 flex items-center gap-2">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
              Optional: Full Dashboard Access
            </span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <p className="text-[11px] text-[var(--text-secondary)] mb-3">
            Add an Admin API key to unlock subscription details, usage history, cost tracking, and
            organization info.
          </p>

          <KeyField
            label="Admin API Key (optional)"
            value={adminKey}
            onChange={setAdminKey}
            placeholder="sk-ant-admin-..."
            visible={showAdmin}
            onToggle={() => setShowAdmin((v) => !v)}
            error={adminError}
          />

          <p className="text-[10px] text-[var(--text-secondary)] mt-2">
            Admin keys are only available for organization accounts.
          </p>
          <button
            onClick={() => openExternal(URLS.CONSOLE_ADMIN_KEYS)}
            className="text-[11px] text-accent-blue hover:underline inline-flex items-center gap-1 mt-1"
          >
            Get Admin key <ExternalLink size={11} />
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full mt-4 h-8 rounded-md text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface KeyFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  error?: string | null;
}

function KeyField({ label, value, onChange, placeholder, visible, onToggle, error }: KeyFieldProps) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
        {label}
      </label>
      <div
        className={`flex items-center rounded-md bg-[var(--bg-primary)] border ${
          error ? 'border-accent-red' : 'border-[var(--border)]'
        } focus-within:border-accent-blue transition`}
      >
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="flex-1 bg-transparent px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          className="px-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 text-[11px]"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={13} /> : <Eye size={13} />}
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <div className="text-[11px] text-accent-red mt-1.5">{error}</div>}
    </div>
  );
}
