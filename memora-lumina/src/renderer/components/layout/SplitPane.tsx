import React, { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@renderer/stores/useAppStore';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export const SplitPane: React.FC<SplitPaneProps> = ({ left, right }) => {
  const ratio = useAppStore((s) => s.splitRatio);
  const setRatio = useAppStore((s) => s.setSplitRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = (e.clientX - rect.left) / rect.width;
      setRatio(newRatio);
    };
    const onUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [setRatio]);

  return (
    <div ref={containerRef} className="flex w-full h-full overflow-hidden">
      <div className="h-full overflow-hidden" style={{ width: `${ratio * 100}%` }}>
        {left}
      </div>
      <div
        onMouseDown={onMouseDown}
        className="w-[3px] bg-border hover:bg-accent transition-colors cursor-col-resize flex-shrink-0"
      />
      <div className="h-full flex-1 overflow-hidden">{right}</div>
    </div>
  );
};
