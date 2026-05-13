import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@renderer/components/common/Badge';

interface Props {
  onNext: () => void;
}

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic (Claude)', tagline: 'Frontier reasoning with deep memory recall', enabled: true },
  { id: 'openai', name: 'OpenAI', tagline: 'GPT-4 family', enabled: false },
  { id: 'grok', name: 'Grok (xAI)', tagline: 'Live data and humor', enabled: false },
  { id: 'gemini', name: 'Google Gemini', tagline: 'Multimodal native', enabled: false },
];

export const StepChooseAI: React.FC<Props> = ({ onNext }) => {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight mb-1">Choose your AI</h1>
      <p className="text-text-secondary text-[13.5px] mb-6">You can add more later in Settings.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            disabled={!p.enabled}
            onClick={() => p.enabled && onNext()}
            className={`text-left rounded-lg border p-4 transition-all ${
              p.enabled
                ? 'border-border bg-surface-card hover:border-accent hover:bg-surface-elevated cursor-pointer'
                : 'border-border-subtle bg-surface-card/50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-text-primary">{p.name}</div>
              {p.enabled ? <Badge variant="accent">Available</Badge> : <Badge>Coming Soon</Badge>}
            </div>
            <div className="text-text-secondary text-[12.5px]">{p.tagline}</div>
            {p.enabled ? (
              <div className="mt-3 inline-flex items-center gap-1 text-accent text-[12.5px] font-medium">
                Continue <ArrowRight size={13} />
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
};
