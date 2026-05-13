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
    loadConversations();
    loadMemories();
    loadStats();
    // Open initial tabs
    (async () => {
      if (tabs.length > 0) return;
      const convs = await window.memora.getConversations();
      if (convs.length === 0) {
        const conv = await createConversation();
        openTab({ kind: 'chat', title: conv.title || 'New chat', conversationId: conv.id });
      } else {
        const first = convs[0];
        openTab({ kind: 'chat', title: first.title, conversationId: first.id });
      }
      if (openMemoryOnStart) {
        openTab({ kind: 'memory-stream', title: 'Memory Stream' });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (!loaded || phase === 'splash') return <SplashScreen />;
  if (phase === 'onboarding') return <OnboardingFlow onComplete={() => setPhase('app')} />;
  return <AppShell />;
};
