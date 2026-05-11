import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import type { ApiProvider } from '../types';

const PROVIDERS: { id: ApiProvider; label: string; hint: string }[] = [
  { id: 'xai-grok', label: 'xAI · Grok Imagine', hint: 'sk-grok-…' },
  { id: 'openai', label: 'OpenAI', hint: 'sk-…' },
  { id: 'anthropic', label: 'Anthropic', hint: 'sk-ant-…' },
  { id: 'replicate', label: 'Replicate', hint: 'r8_…' },
];

export function ApiConnectionCard() {
  const plan = useAppStore((s) => s.plan);
  const byok = useAppStore((s) => s.byok);
  const setByok = useAppStore((s) => s.setByok);
  const setUpgradeOpen = useAppStore((s) => s.setUpgradeOpen);

  const [expanded, setExpanded] = useState(byok.enabled);
  const [showKey, setShowKey] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const [testing, setTesting] = useState<'idle' | 'testing' | 'ok'>('idle');

  const isPro = plan === 'pro';
  const provider = PROVIDERS.find((p) => p.id === byok.provider) ?? PROVIDERS[0];
  const masked = byok.apiKey ? `${byok.apiKey.slice(0, 4)}••••${byok.apiKey.slice(-4)}` : '';

  const handleTest = () => {
    setTesting('testing');
    setTimeout(() => setTesting('ok'), 900);
    setTimeout(() => setTesting('idle'), 2400);
  };

  if (!isPro) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-bg-secondary p-4">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-warning/15 blur-3xl" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-tertiary">
            <Lock size={18} className="text-warning" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold text-white">Bring your own API key</p>
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-warning">
                Pro
              </span>
            </div>
            <p className="mt-1 text-[12px] text-text-secondary">
              Connect Grok, OpenAI, Anthropic or Replicate and skip the per-render cost. Your prompts stay private — only your keywords can shape the look.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setUpgradeOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-gradient-end px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-glow-sm"
            >
              <Sparkles size={12} /> Unlock with Pro
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-bg-secondary">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-tertiary">
            <KeyRound size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white">API Connection</p>
            <p className="text-[11px] text-text-secondary">
              {byok.enabled ? `Using your ${provider.label} key` : 'Use the MoodShift cloud'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {byok.enabled && (
            <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-success">
              <Check size={10} strokeWidth={3} /> On
            </span>
          )}
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-text-muted">
            <ChevronDown size={16} />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="space-y-3 p-4">
              {/* Enable toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-white">Use my own key</p>
                  <p className="text-[11px] text-text-secondary">
                    When on, renders bill to your provider, not ours.
                  </p>
                </div>
                <button
                  onClick={() => setByok({ enabled: !byok.enabled })}
                  className={`relative inline-flex h-6 w-10 rounded-full transition-colors ${
                    byok.enabled ? 'bg-accent' : 'bg-white/15'
                  }`}
                >
                  <motion.span
                    animate={{ x: byok.enabled ? 18 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                  />
                </button>
              </div>

              {/* Provider picker */}
              <div className="relative">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  Provider
                </label>
                <button
                  onClick={() => setProviderOpen((v) => !v)}
                  className="mt-1 flex w-full items-center justify-between rounded-xl border border-white/8 bg-bg-tertiary px-3 py-2.5 text-left text-[13px] text-white"
                >
                  {provider.label}
                  <motion.span animate={{ rotate: providerOpen ? 180 : 0 }} className="text-text-muted">
                    <ChevronDown size={14} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {providerOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-surface shadow-xl"
                    >
                      {PROVIDERS.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => {
                              setByok({ provider: p.id });
                              setProviderOpen(false);
                            }}
                            className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] text-white hover:bg-white/5"
                          >
                            {p.label}
                            {p.id === byok.provider && (
                              <Check size={14} className="text-accent" strokeWidth={3} />
                            )}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* API key */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  API Key
                </label>
                <div className="mt-1 flex items-stretch overflow-hidden rounded-xl border border-white/8 bg-bg-tertiary">
                  <input
                    value={byok.apiKey}
                    onChange={(e) => setByok({ apiKey: e.target.value })}
                    placeholder={provider.hint}
                    type={showKey ? 'text' : 'password'}
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 bg-transparent px-3 py-2.5 font-mono text-[12px] text-white placeholder:text-text-muted outline-none"
                  />
                  <button
                    onClick={() => setShowKey((v) => !v)}
                    className="px-3 text-text-muted hover:text-white"
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {!showKey && masked && (
                  <p className="mt-1 font-mono text-[11px] text-text-muted">{masked}</p>
                )}
              </div>

              {/* Keywords */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  Custom Keywords
                </label>
                <textarea
                  value={byok.keywords}
                  onChange={(e) => setByok({ keywords: e.target.value })}
                  placeholder="e.g. moody, cinematic, anamorphic flare, 35mm"
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border border-white/8 bg-bg-tertiary px-3 py-2.5 text-[13px] text-white placeholder:text-text-muted outline-none focus:border-accent/50"
                />
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-text-muted">
                  <Shield size={11} /> Our style prompts stay private. Your keywords are appended only when you enable them.
                </p>
              </div>

              {/* Test button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleTest}
                disabled={!byok.apiKey || testing !== 'idle'}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/8 bg-bg-tertiary py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
              >
                {testing === 'testing' && (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                    className="block h-3.5 w-3.5 rounded-full border-2 border-transparent border-t-white"
                  />
                )}
                {testing === 'idle' && 'Test connection'}
                {testing === 'testing' && 'Pinging provider…'}
                {testing === 'ok' && (
                  <span className="flex items-center gap-1.5 text-success">
                    <Check size={14} strokeWidth={3} /> Connection looks good
                  </span>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
