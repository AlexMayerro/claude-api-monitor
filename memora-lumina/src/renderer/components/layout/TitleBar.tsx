import React, { useEffect, useState } from 'react';
import { Minus, Square, X, Copy } from 'lucide-react';
import { TabBar } from './TabBar';
import { APP_NAME } from '@renderer/lib/constants';

export const TitleBar: React.FC = () => {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    window.memora.isMaximized().then(setMaximized);
    const off = window.memora.onWindowStateChanged((s) => setMaximized(s.maximized));
    return off;
  }, []);

  return (
    <div
      className="h-[44px] flex items-stretch bg-bg-secondary border-b border-border-subtle drag-region select-none"
      onDoubleClick={(e) => {
        // Only maximize when the double-click happened on the drag region itself,
        // not on a child button (.no-drag descendants stop propagation themselves).
        if (e.target === e.currentTarget) window.memora.maximize();
      }}
    >
      <div
        className="flex items-center gap-2 px-3 flex-shrink-0"
        onDoubleClick={() => window.memora.maximize()}
      >
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white text-[12px] font-bold">
          M
        </div>
        <span className="text-[13px] font-semibold text-text-primary tracking-tight">{APP_NAME}</span>
      </div>
      <div className="flex-1 min-w-0 flex items-stretch overflow-hidden">
        <TabBar />
      </div>
      <div className="flex items-stretch no-drag flex-shrink-0">
        <button
          onClick={() => window.memora.minimize()}
          className="w-12 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          aria-label="Minimize"
        >
          <Minus size={15} />
        </button>
        <button
          onClick={() => window.memora.maximize()}
          className="w-12 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          aria-label={maximized ? 'Restore' : 'Maximize'}
        >
          {maximized ? <Copy size={13} /> : <Square size={12} />}
        </button>
        <button
          onClick={() => window.memora.close()}
          className="w-12 flex items-center justify-center text-text-secondary hover:bg-error hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
