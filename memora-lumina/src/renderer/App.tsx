import React, { useEffect, useState } from 'react';
import { useSettingsStore } from './stores/useSettingsStore';
import { useAppStore } from './stores/useAppStore';
import { useChatStore } from './stores/useChatStore';
import { useMemoryStore } from './stores/useMemoryStore';
import { useTheme } from './hooks/useTheme';
import { useIPCListeners } from './hooks/useIPC';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { SplashScreen } from './components/splash/SplashScreen';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { AppShell } from './components/layout/AppShell';

export const App: React.FC = () => {
  const loaded = useSettingsStore((s) => s.loaded);
  const load = useSettingsStore((s) => s.load);
  const onboardingCompleted = useSettingsStore((s) => s.settings.onboarding_completed);
  const openMemoryOnStart = useSettingsStore((s) => s.settings.open_memory_stream_on_start);
  const [phase, setPhase] = useState<'splash' | 'onboarding' | 'app'>('splash');

  const openTab = useAppStore((s) => s.openTab);
  const tabs = useAppStore((s) => s.tabs);
  const createConversation = useChatStore((s) => s.createConversation);
  const loadConversations = useChatStore((s) => s.loadConversations);
  const loadMemories = useMemoryStore((s) => s.loadMemories);
  const loadStats = useMemoryStore((s) => s.loadStats);

  useTheme();
  useIPCListeners();
  useKeyboardShortcuts();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!loaded) return;
    const minSplashMs = onboardingCompleted ? 900 : 1700;
    const t = setTimeout(() => {
      if (!onboardingCompleted) setPhase('onboarding');
      else setPhase('app');
    }, minSplashMs);
    return () => clearTimeout(t);
  }, [loaded, onboardingCompleted]);

  useEffect(() => {
    if (phase !== 'app') return;
    loadConversations().catch((err) => console.error('[App] loadConversations failed:', err));
    loadMemories().catch((err) => console.error('[App] loadMemories failed:', err));
    loadStats().catch((err) => console.error('[App] loadStats failed:', err));
    (async () => {
      try {
        if (tabs.length > 0) return;
        let opened = false;
        try {
          const convs = await window.memora.getConversations();
          if (convs.length === 0) {
            const conv = await createConversation();
            openTab({ kind: 'chat', title: conv.title || 'New chat', conversationId: conv.id });
          } else {
            const first = convs[0];
            openTab({ kind: 'chat', title: first.title, conversationId: first.id });
          }
          opened = true;
        } catch (err) {
          console.error('[App] Failed to bootstrap initial chat tab from IPC:', err);
        }
        if (!opened) {
          // Fallback: open a local-only tab so the user is never stuck on a blank screen.
          openTab({ kind: 'chat', title: 'New chat', conversationId: `local-${Date.now()}` });
        }
        if (openMemoryOnStart) {
          try {
            openTab({ kind: 'memory-stream', title: 'Memory Stream' });
          } catch (err) {
            console.error('[App] Failed to open Memory Stream tab:', err);
          }
        }
      } catch (err) {
        console.error('[App] Initial tab bootstrap crashed:', err);
        try {
          openTab({ kind: 'chat', title: 'New chat', conversationId: `local-${Date.now()}` });
        } catch {
          // ignore — AppShell renders a recovery button when no tabs exist
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (!loaded || phase === 'splash') return <SplashScreen />;
  if (phase === 'onboarding') return <OnboardingFlow onComplete={() => setPhase('app')} />;
  return <AppShell />;
};
