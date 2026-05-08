import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  right?: React.ReactNode;
}

export function CollapsibleSection({ title, defaultOpen = true, children, right }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [maxH, setMaxH] = useState<string>(defaultOpen ? '5000px' : '0px');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      setMaxH(`${ref.current.scrollHeight + 32}px`);
      const t = setTimeout(() => setMaxH('5000px'), 240);
      return () => clearTimeout(t);
    }
    setMaxH(`${ref.current.scrollHeight}px`);
    requestAnimationFrame(() => setMaxH('0px'));
  }, [open, children]);

  return (
    <section className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            size={14}
            className="text-[var(--text-secondary)]"
            style={{
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 200ms ease',
            }}
          />
          <span className="text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-wide">
            {title}
          </span>
        </div>
        {right}
      </button>
      <div
        className="collapsible-content"
        style={{ maxHeight: maxH, opacity: open ? 1 : 0 }}
      >
        <div ref={ref} className="px-3 pb-3">
          {children}
        </div>
      </div>
    </section>
  );
}
