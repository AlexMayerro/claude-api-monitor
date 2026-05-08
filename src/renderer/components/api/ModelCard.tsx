import { Brain, Layers, FileText, Image, Code, Quote, Puzzle } from 'lucide-react';
import type { ModelInfo } from '../../utils/api-types';
import { FAMILY_COLORS, familyOf } from '../../utils/constants';
import { formatDate, formatNumber } from '../../utils/formatters';

const CAPABILITIES: Array<{
  key: keyof NonNullable<ModelInfo['capabilities']>;
  Icon: typeof Brain;
  label: string;
}> = [
  { key: 'thinking', Icon: Brain, label: 'Extended thinking' },
  { key: 'batch', Icon: Layers, label: 'Batch API' },
  { key: 'pdf_input', Icon: FileText, label: 'PDF input' },
  { key: 'image_input', Icon: Image, label: 'Image input' },
  { key: 'code_execution', Icon: Code, label: 'Code execution' },
  { key: 'citations', Icon: Quote, label: 'Citations' },
  { key: 'structured_outputs', Icon: Puzzle, label: 'Structured outputs' },
];

export function ModelCard({ model }: { model: ModelInfo }) {
  const fam = familyOf(model.id);
  const accent = fam ? FAMILY_COLORS[fam] : '#6C8CFF';

  return (
    <div
      className="rounded-md bg-[var(--bg-primary)] border border-[var(--border)] p-2.5 pl-3"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
          <span className="text-[12px] font-semibold text-[var(--text-primary)]">
            {model.display_name}
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-secondary)]">
          {formatDate(model.created_at)}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] mb-1.5">
        <span>
          Context:{' '}
          <span className="text-[var(--text-primary)]">{formatNumber(model.max_input_tokens)}</span> tokens
        </span>
        <span>
          Max Output:{' '}
          <span className="text-[var(--text-primary)]">{formatNumber(model.max_tokens)}</span>
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {CAPABILITIES.map(({ key, Icon, label }) => {
          const cap = model.capabilities?.[key];
          const supported = cap?.supported === true;
          return (
            <div
              key={key}
              title={`${label}: ${supported ? 'supported' : 'not supported'}`}
              className="w-5 h-5 flex items-center justify-center rounded"
              style={{ opacity: supported ? 1 : 0.2, color: 'var(--text-primary)' }}
            >
              <Icon size={12} />
            </div>
          );
        })}
      </div>
      <div className="mt-1 text-[10px] font-mono text-[var(--text-secondary)] truncate" title={model.id}>
        {model.id}
      </div>
    </div>
  );
}
