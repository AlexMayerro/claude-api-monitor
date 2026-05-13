import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@renderer/components/common/Button';
import { Input } from '@renderer/components/common/Input';

interface Props {
  onBack: () => void;
  onNext: (apiKey: string) => void;
}

export const StepConnectAPI: React.FC<Props> = ({ onBack, onNext }) => {
  const [value, setValue] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    setError(null);
    setVerified(false);
    setVerifying(true);
    try {
      const result = await window.memora.validateApiKey(value.trim());
      if (result.valid) {
        setVerified(true);
        setTimeout(() => onNext(value.trim()), 600);
      } else {
        setError(result.error || 'Could not verify this key.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight mb-1">Connect Claude</h1>
      <p className="text-text-secondary text-[13.5px] mb-6">
        Enter your Anthropic API key. It stays on your computer — never sent anywhere else.
      </p>

      <Input
        prefix={<KeyRound size={15} />}
        placeholder="sk-ant-..."
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) handleVerify();
        }}
      />

      <button
        type="button"
        onClick={() => window.memora.openExternal('https://console.anthropic.com/')}
        className="mt-2 inline-flex items-center gap-1 text-[12px] text-text-muted hover:text-accent"
      >
        How to get your API key <ExternalLink size={11} />
      </button>

      {error ? (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-md bg-[var(--error-bg)] border border-error/30 text-error text-[13px]">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {verified ? (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-md bg-[var(--success-bg)] border border-success/30 text-success text-[13px]">
          <CheckCircle2 size={15} />
          Connected to Anthropic. Loading next step…
        </div>
      ) : null}

      <div className="flex items-center justify-between mt-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </Button>
        <Button onClick={handleVerify} loading={verifying} disabled={!value.trim() || verified}>
          {verified ? 'Connected' : 'Verify & Connect'} <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
};
