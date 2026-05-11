import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

/**
 * A 390x844 phone-shaped viewport centered on the page with a soft device
 * shadow. On phones narrower than 390px the frame fills the width.
 */
export function PhoneFrame({ children }: Props) {
  return (
    <div
      className="app-shell relative overflow-hidden bg-bg-primary shadow-device"
      style={{
        width: 'min(390px, 100vw)',
        height: 'min(844px, 100vh)',
        borderRadius: 'min(40px, 8vw)',
      }}
    >
      {/* Status bar mock */}
      <div className="absolute left-0 right-0 top-0 z-50 flex h-6 items-center justify-between px-6 pt-1 text-[11px] font-semibold text-white/85 pointer-events-none">
        <span className="tabular">9:41</span>
        <div className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/85" />
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/85" />
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/85" />
          <span className="ml-1 inline-block h-2 w-4 rounded-[2px] border border-white/70" />
        </div>
      </div>
      {/* Notch */}
      <div className="pointer-events-none absolute left-1/2 top-1 z-50 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
      {children}
    </div>
  );
}
