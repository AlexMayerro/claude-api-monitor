import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepChooseAI } from './StepChooseAI';
import { StepConnectAPI } from './StepConnectAPI';
import { StepProfile } from './StepProfile';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import { APP_NAME, APP_TAGLINE } from '@renderer/lib/constants';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [building, setBuilding] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const updateSetting = useSettingsStore((s) => s.update);

  const handleProfileComplete = async (profile: { name: string; primary_use: string; initial_context: string }) => {
    setCompletionError(null);
    setBuilding(true);
    try {
      await updateSetting('api_key', apiKey);
      await updateSetting('ai_provider', 'anthropic');
      await window.memora.updateProfile(profile);
      await updateSetting('onboarding_completed', true);
      setTimeout(() => {
        onComplete();
      }, 2400);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save your profile.';
      console.error('[Onboarding] handleProfileComplete failed:', err);
      setCompletionError(message);
      setBuilding(false);
    }
  };

  const handleSkip = () => {
    setCompletionError(null);
    onComplete();
  };

  if (building) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary">
        <div className="splash-logo w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white text-4xl font-bold shadow-elevated">
          M
        </div>
        <div className="mt-6 text-xl font-semibold tracking-tight">Building your Memory Palace…</div>
        <div className="mt-2 text-text-secondary text-sm">Indexing, calibrating, and waking the brain.</div>
      </div>
    );
  }

  if (completionError) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary px-8">
        <div className="w-14 h-14 rounded-2xl bg-[var(--error-bg)] border border-error/40 text-error flex items-center justify-center mb-4">!</div>
        <div className="text-xl font-semibold tracking-tight">Couldn't finish setting up.</div>
        <div className="mt-2 text-text-secondary text-sm text-center max-w-md">{completionError}</div>
        <div className="mt-6 flex gap-3">
          <button
            className="h-9 px-4 rounded-md bg-surface-elevated text-text-primary border border-border hover:bg-surface-active"
            onClick={() => setCompletionError(null)}
          >
            Try again
          </button>
          <button
            className="h-9 px-4 rounded-md bg-accent text-white hover:bg-accent-hover"
            onClick={handleSkip}
          >
            Continue anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      <div className="h-[44px] drag-region" />
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-xl">
          <div className="text-center mb-10">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-hover items-center justify-center text-white text-2xl font-bold shadow-elevated mb-4">
              M
            </div>
            <div className="text-2xl font-semibold tracking-tight">{APP_NAME}</div>
            <div className="text-text-secondary text-sm mt-1">{APP_TAGLINE}</div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step ? 'bg-accent w-10' : s < step ? 'bg-accent/60 w-6' : 'bg-surface-active w-6'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && <StepChooseAI onNext={() => setStep(2)} />}
              {step === 2 && (
                <StepConnectAPI
                  onBack={() => setStep(1)}
                  onNext={(key) => {
                    setApiKey(key);
                    setStep(3);
                  }}
                />
              )}
              {step === 3 && <StepProfile onBack={() => setStep(2)} onComplete={handleProfileComplete} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
