import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import type { AuthMethod } from '../types';

type Mode = 'choose' | 'email';

export function AuthScreen() {
  const signInAs = useAppStore((s) => s.signInAs);
  const signInAsGuest = useAppStore((s) => s.signInAsGuest);
  const [mode, setMode] = useState<Mode>('choose');
  const [pending, setPending] = useState<AuthMethod | 'guest' | null>(null);

  const doSocial = (method: AuthMethod) => {
    setPending(method);
    // Simulated round-trip so the buttons feel real.
    setTimeout(() => {
      signInAs(method);
      setPending(null);
    }, 700);
  };

  return (
    <div className="absolute inset-0 z-[55] flex flex-col bg-bg-primary">
      <div className="aurora" />

      {/* Hero / branding */}
      <div className="relative flex flex-1 flex-col items-center justify-end px-8 pb-6 pt-16">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative mb-4"
        >
          <div className="absolute inset-0 -m-6 rounded-full bg-accent/30 blur-2xl" />
          <svg width="56" height="56" viewBox="0 0 64 64" className="relative">
            <defs>
              <linearGradient id="authg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            <path
              d="M32 10l5.5 11.5L50 26l-9 8.6L43 48 32 41.8 21 48l2-13.4L14 26l12.5-4.5z"
              fill="url(#authg)"
            />
          </svg>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-[28px] font-extrabold tracking-tight text-white"
        >
          MoodShift
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-1 text-[13px] text-text-secondary"
        >
          Sign in to shift your reality
        </motion.p>
      </div>

      {/* Buttons */}
      <div className="relative flex-1 px-6 pb-6">
        <AnimatePresence mode="wait" initial={false}>
          {mode === 'choose' ? (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-2.5"
            >
              <AppleButton
                loading={pending === 'apple'}
                onClick={() => doSocial('apple')}
              />
              <GoogleButton
                loading={pending === 'google'}
                onClick={() => doSocial('google')}
              />
              <FacebookButton
                loading={pending === 'facebook'}
                onClick={() => doSocial('facebook')}
              />

              <div className="my-2 flex items-center gap-3 text-text-muted">
                <span className="h-px flex-1 bg-white/8" />
                <span className="text-[11px] uppercase tracking-widest">or</span>
                <span className="h-px flex-1 bg-white/8" />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode('email')}
                className="flex h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-bg-secondary text-[14px] font-semibold text-white"
              >
                <Mail size={16} />
                Continue with email
              </motion.button>

              <button
                onClick={() => {
                  setPending('guest');
                  setTimeout(() => {
                    signInAsGuest();
                    setPending(null);
                  }, 350);
                }}
                className="mt-4 self-center text-[13px] text-text-secondary"
              >
                <span className="underline decoration-text-muted/40 underline-offset-4">
                  Continue as guest
                </span>
                <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                  <Sparkles size={10} /> 3 free
                </span>
              </button>

              <p className="mt-3 px-2 text-center text-[10px] leading-relaxed text-text-muted">
                By continuing you agree to MoodShift's Terms & Privacy Policy.
              </p>
            </motion.div>
          ) : (
            <EmailForm
              key="email"
              loading={pending === 'email'}
              onCancel={() => setMode('choose')}
              onSubmit={(email, name) => {
                setPending('email');
                setTimeout(() => {
                  signInAs('email', { email, name });
                  setPending(null);
                }, 700);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AppleButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={loading}
      onClick={onClick}
      className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-white text-[14px] font-semibold text-black disabled:opacity-70"
    >
      {loading ? (
        <Spinner dark />
      ) : (
        <>
          <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor">
            <path d="M11.62 0c.08 1.08-.36 2.15-.94 2.93-.62.83-1.6 1.47-2.57 1.4-.09-1.06.41-2.16.96-2.85C9.7.65 10.77.06 11.62 0Zm3.18 13.46c-.36.79-.53 1.15-.99 1.85-.65.97-1.56 2.18-2.7 2.19-1 .01-1.26-.65-2.62-.64-1.37.01-1.65.65-2.66.64-1.13-.01-1.99-1.1-2.64-2.07C.31 12.7.13 9.18 1.27 7.31c.81-1.33 2.09-2.1 3.29-2.1 1.22 0 1.99.67 3 .67.97 0 1.56-.68 2.97-.68 1.07 0 2.2.58 3 1.59-2.64 1.45-2.21 5.21.27 6.67Z" />
          </svg>
          Continue with Apple
        </>
      )}
    </motion.button>
  );
}

function GoogleButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={loading}
      onClick={onClick}
      className="flex h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white text-[14px] font-semibold text-[#202124] disabled:opacity-70"
    >
      {loading ? (
        <Spinner dark />
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84c-.21 1.12-.84 2.07-1.78 2.71v2.25h2.88c1.68-1.55 2.7-3.83 2.7-6.61z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.88-2.25c-.8.54-1.83.86-3.08.86-2.37 0-4.38-1.6-5.1-3.75H.96v2.32A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.9 10.68a5.42 5.42 0 0 1 0-3.36V5H.96a9 9 0 0 0 0 8l2.94-2.32z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 5L3.9 7.32C4.62 5.17 6.63 3.58 9 3.58z" />
          </svg>
          Continue with Google
        </>
      )}
    </motion.button>
  );
}

function FacebookButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={loading}
      onClick={onClick}
      className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#1877F2] text-[14px] font-semibold text-white disabled:opacity-70"
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.408.593 24 1.325 24H12.82V14.706h-3.13v-3.62h3.13V8.41c0-3.1 1.893-4.79 4.66-4.79 1.325 0 2.464.1 2.795.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.764v2.31h3.59l-.467 3.62h-3.123V24h6.116c.73 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0z" />
          </svg>
          Continue with Facebook
        </>
      )}
    </motion.button>
  );
}

function EmailForm({
  loading,
  onCancel,
  onSubmit,
}: {
  loading: boolean;
  onCancel: () => void;
  onSubmit: (email: string, name: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const valid = email.includes('@') && password.length >= 4;

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit(email, name || email.split('@')[0]);
      }}
      className="flex flex-col gap-2.5"
    >
      <Field label="Name" value={name} onChange={setName} placeholder="Your name (optional)" />
      <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
      <Field label="Password" value={password} onChange={setPassword} placeholder="At least 4 characters" type="password" />

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={!valid || loading}
        type="submit"
        className="mt-1 flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-gradient-end text-[14px] font-semibold text-white shadow-glow disabled:opacity-50 disabled:shadow-none"
      >
        {loading ? <Spinner /> : (<>Continue<ArrowRight size={16} /></>)}
      </motion.button>
      <button
        type="button"
        onClick={onCancel}
        className="mt-1 self-center text-[13px] text-text-secondary"
      >
        ← Back
      </button>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
        <Lock size={11} /> Your password never leaves your device in this prototype.
      </p>
    </motion.form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 rounded-2xl border border-white/8 bg-bg-secondary/70 px-4 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="w-full bg-transparent text-[14px] text-white placeholder:text-text-muted outline-none"
      />
    </label>
  );
}

function Spinner({ dark }: { dark?: boolean } = {}) {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      className={`block h-4 w-4 rounded-full border-2 border-transparent ${
        dark ? 'border-t-black' : 'border-t-white'
      }`}
    />
  );
}
