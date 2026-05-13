import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@renderer/components/common/Button';
import { Input } from '@renderer/components/common/Input';
import { Select } from '@renderer/components/common/Select';
import { PRIMARY_USE_OPTIONS } from '@renderer/lib/constants';

interface Props {
  onBack: () => void;
  onComplete: (profile: { name: string; primary_use: string; initial_context: string }) => void;
}

export const StepProfile: React.FC<Props> = ({ onBack, onComplete }) => {
  const [name, setName] = useState('');
  const [primaryUse, setPrimaryUse] = useState('General');
  const [context, setContext] = useState('');

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight mb-1">Tell me about yourself</h1>
      <p className="text-text-secondary text-[13.5px] mb-6">This helps me remember what matters to you.</p>

      <div className="space-y-4">
        <div>
          <label className="text-[12.5px] uppercase tracking-wide text-text-muted font-semibold">
            What should I call you?
          </label>
          <Input
            className="mt-1.5"
            placeholder="e.g. Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="text-[12.5px] uppercase tracking-wide text-text-muted font-semibold">
            What will you mainly use me for?
          </label>
          <div className="mt-1.5">
            <Select
              value={primaryUse}
              onChange={setPrimaryUse}
              options={PRIMARY_USE_OPTIONS.map((o) => ({ value: o, label: o }))}
            />
          </div>
        </div>

        <div>
          <label className="text-[12.5px] uppercase tracking-wide text-text-muted font-semibold">
            Anything important I should know from the start?
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Optional — your role, current projects, things that matter to you."
            rows={4}
            className="mt-1.5 w-full rounded-md border border-border bg-surface-card text-text-primary px-3 py-2.5 outline-none focus:border-accent resize-none text-[13.5px] placeholder:text-text-muted"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-7">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </Button>
        <Button
          onClick={() =>
            onComplete({ name: name.trim() || 'Friend', primary_use: primaryUse, initial_context: context.trim() })
          }
          disabled={!name.trim()}
        >
          <Sparkles size={14} /> Start Using Memora Lumina
        </Button>
      </div>
    </div>
  );
};
