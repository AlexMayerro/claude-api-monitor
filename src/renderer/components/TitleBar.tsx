import { Minus, Pin, X } from 'lucide-react';
import { useApp } from '../store/appStore';
import { api } from '../utils/bridge';
import { updateSettings } from '../hooks/useSettings';

export function TitleBar() {
  const alwaysOnTop = useApp((s) => s.settings?.alwaysOnTop ?? true);

  const onMinimize = () => api().windowMinimize();
  const onClose = () => api().windowClose();
  const onTogglePin = async () => {
    const next = !alwaysOnTop;
    await updateSettings({ alwaysOnTop: next });
    await api().windowSetTop(next);
  };

  return (
    <div className="titlebar-drag flex items-center justify-between h-[38px] px-3 select-none border-b border-[var(--border)] bg-[var(--bg-primary)]">
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #6C8CFF 100%)' }}
        >
          CM
        </div>
        <span className="text-[12px] font-semibold text-[var(--text-primary)]">Claude Monitor</span>
      </div>
      <div className="no-drag flex items-center gap-1">
        <button
          onClick={onMinimize}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          title="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={onTogglePin}
          className={`w-8 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] ${
            alwaysOnTop ? 'text-accent-blue' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          title={alwaysOnTop ? 'Unpin (always on top)' : 'Pin (always on top)'}
        >
          <Pin
            size={14}
            style={{
              transform: alwaysOnTop ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'transform 200ms ease',
            }}
          />
        </button>
        <button
          onClick={onClose}
          className="w-8 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-accent-red hover:text-white"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
