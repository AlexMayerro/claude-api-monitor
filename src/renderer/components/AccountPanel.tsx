import { X, ExternalLink } from 'lucide-react';
import { useApp } from '../store/appStore';
import { api } from '../utils/bridge';
import { URLS } from '../utils/constants';

export function AccountPanel({ onChangeKeys }: { onChangeKeys: () => void }) {
  const open = useApp((s) => s.showAccount);
  const close = () => useApp.getState().toggleAccountPanel(false);
  const keys = useApp((s) => s.keys);
  const org = useApp((s) => s.org);

  if (!open) return null;

  const apiTail = keys?.apiKeyTail ? `••••${keys.apiKeyTail}` : 'Not connected';
  const adminTail = keys?.adminKeyTail ? `••••${keys.adminKeyTail}` : 'Not connected';

  return (
    <div className="absolute inset-0 z-30 flex">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={close} />
      <div className="relative ml-auto w-full bg-[var(--bg-primary)] flex flex-col animate-slide-in">
        <div className="flex items-center justify-between h-[40px] px-3 border-b border-[var(--border)]">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--text-primary)]">
            Account
          </span>
          <button
            onClick={close}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollarea p-3 space-y-3">
          <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] p-4">
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Connected as
            </div>
            <div className="text-[14px] font-semibold text-[var(--text-primary)]">
              {org?.name ?? (keys?.hasAdminKey ? 'Loading…' : 'Standard API Account')}
            </div>
            {org?.id && (
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-mono">
                {org.id}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] p-3 space-y-2">
            <Row label="API Key" value={apiTail} />
            <Row label="Admin Key" value={adminTail} muted={!keys?.hasAdminKey} />
          </div>

          <button
            onClick={() => { close(); onChangeKeys(); }}
            className="w-full h-9 rounded-md bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[12px] text-[var(--text-primary)] font-medium"
          >
            Change Keys
          </button>
          <button
            onClick={async () => {
              await api().clearKeys();
              useApp.getState().setKeys({ hasApiKey: false, hasAdminKey: false });
              useApp.getState().setReconnectScreen(true);
              close();
            }}
            className="w-full h-9 rounded-md border border-accent-red/40 text-accent-red hover:bg-accent-red/10 text-[12px] font-medium"
          >
            Disconnect
          </button>

          <button
            onClick={() => api().openExternal(URLS.CONSOLE)}
            className="flex items-center gap-1.5 text-[11px] text-accent-blue hover:underline"
          >
            Open Anthropic Console <ExternalLink size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-[var(--text-secondary)]">{label}</span>
      <span className={`text-[11px] font-mono ${muted ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
        {value}
      </span>
    </div>
  );
}
