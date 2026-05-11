import { create } from 'zustand';
import type {
  AuthMethod,
  AuthState,
  ByokConfig,
  Plan,
  RegradedPhoto,
  TabKey,
} from '../types';

const GUEST_LIMIT = 3;
const FREE_DAILY_LIMIT = 5;

const STORAGE_KEY = 'moodshift.v1';

interface PersistedSlice {
  auth: AuthState;
  guestUsed: number;
  usedToday: number;
  plan: Plan;
  byok: ByokConfig;
  favorites: string[];
}

function loadPersisted(): Partial<PersistedSlice> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedSlice;
  } catch {
    return {};
  }
}

function persist(slice: PersistedSlice) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slice));
  } catch {
    /* ignore quota errors */
  }
}

const persisted = loadPersisted();

interface AppState {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;

  /** Saved regraded photos in this session. */
  regrades: RegradedPhoto[];
  addRegrade: (photo: RegradedPhoto) => void;
  removeRegrade: (id: string) => void;

  /** Style IDs the user has hearted. */
  favorites: Set<string>;
  toggleFavorite: (styleId: string) => void;

  /** Auth */
  auth: AuthState;
  signInAs: (method: AuthMethod, identity?: { email?: string; name?: string }) => void;
  signInAsGuest: () => void;
  signOut: () => void;

  /** Plan & paywall state */
  plan: Plan;
  upgradeToPro: () => void;
  downgrade: () => void;
  upgradeOpen: boolean;
  setUpgradeOpen: (open: boolean) => void;
  guestGateOpen: boolean;
  setGuestGateOpen: (open: boolean) => void;

  /** Usage counters */
  guestLimit: number;
  guestUsed: number;
  dailyLimit: number;
  usedToday: number;
  /**
   * Try to consume one generation. Returns true if allowed.
   * Side effects:
   *  - guest at limit → opens guest gate
   *  - free signed-in at daily limit → opens upgrade modal
   *  - pro → always allowed (BYOK or not)
   */
  consumeDaily: () => boolean;

  /** BYOK */
  byok: ByokConfig;
  setByok: (next: Partial<ByokConfig>) => void;

  /** Currently selected style in the regrade flow. */
  pendingStyleId: string | null;
  setPendingStyleId: (id: string | null) => void;

  /** Currently selected source image (object/data URL) for the regrade flow. */
  pendingSrc: string | null;
  setPendingSrc: (src: string | null) => void;

  /** Splash completion. */
  splashDone: boolean;
  setSplashDone: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  const initialAuth: AuthState = persisted.auth ?? { kind: 'none' };
  const initialPlan: Plan = persisted.plan ?? 'free';
  const initialByok: ByokConfig =
    persisted.byok ?? {
      enabled: false,
      provider: 'xai-grok',
      apiKey: '',
      keywords: '',
    };
  const initialFavorites = new Set<string>(persisted.favorites ?? []);

  const writeThrough = () => {
    const s = get();
    persist({
      auth: s.auth,
      guestUsed: s.guestUsed,
      usedToday: s.usedToday,
      plan: s.plan,
      byok: s.byok,
      favorites: Array.from(s.favorites),
    });
  };

  return {
    activeTab: 'discover',
    setActiveTab: (tab) => set({ activeTab: tab }),

    regrades: [],
    addRegrade: (photo) => set((state) => ({ regrades: [photo, ...state.regrades] })),
    removeRegrade: (id) =>
      set((state) => ({ regrades: state.regrades.filter((p) => p.id !== id) })),

    favorites: initialFavorites,
    toggleFavorite: (styleId) => {
      set((state) => {
        const next = new Set(state.favorites);
        if (next.has(styleId)) next.delete(styleId);
        else next.add(styleId);
        return { favorites: next };
      });
      writeThrough();
    },

    auth: initialAuth,
    signInAs: (method, identity) => {
      set({
        auth: {
          kind: 'signed-in',
          method,
          email: identity?.email,
          name: identity?.name ?? defaultNameFor(method),
        },
        guestGateOpen: false,
      });
      writeThrough();
    },
    signInAsGuest: () => {
      set({ auth: { kind: 'guest' } });
      writeThrough();
    },
    signOut: () => {
      set({
        auth: { kind: 'none' },
        plan: 'free',
        byok: { enabled: false, provider: 'xai-grok', apiKey: '', keywords: '' },
        guestUsed: 0,
        usedToday: 0,
      });
      writeThrough();
    },

    plan: initialPlan,
    upgradeToPro: () => {
      set({ plan: 'pro', upgradeOpen: false });
      writeThrough();
    },
    downgrade: () => {
      set({ plan: 'free' });
      writeThrough();
    },
    upgradeOpen: false,
    setUpgradeOpen: (open) => set({ upgradeOpen: open }),
    guestGateOpen: false,
    setGuestGateOpen: (open) => set({ guestGateOpen: open }),

    guestLimit: GUEST_LIMIT,
    guestUsed: persisted.guestUsed ?? 0,
    dailyLimit: FREE_DAILY_LIMIT,
    usedToday: persisted.usedToday ?? 0,
    consumeDaily: () => {
      const { auth, plan, guestUsed, guestLimit, usedToday, dailyLimit } = get();

      if (plan === 'pro') return true;

      if (auth.kind === 'guest') {
        if (guestUsed >= guestLimit) {
          set({ guestGateOpen: true });
          return false;
        }
        set({ guestUsed: guestUsed + 1 });
        writeThrough();
        return true;
      }

      if (auth.kind === 'signed-in') {
        if (usedToday >= dailyLimit) {
          set({ upgradeOpen: true });
          return false;
        }
        set({ usedToday: usedToday + 1 });
        writeThrough();
        return true;
      }

      // auth.kind === 'none' — shouldn't happen in app body, but be safe.
      return false;
    },

    byok: initialByok,
    setByok: (next) => {
      set((state) => ({ byok: { ...state.byok, ...next } }));
      writeThrough();
    },

    pendingStyleId: null,
    setPendingStyleId: (id) => set({ pendingStyleId: id }),

    pendingSrc: null,
    setPendingSrc: (src) => set({ pendingSrc: src }),

    splashDone: false,
    setSplashDone: (v) => set({ splashDone: v }),
  };
});

function defaultNameFor(method: AuthMethod): string {
  switch (method) {
    case 'apple':
      return 'Apple User';
    case 'google':
      return 'Google User';
    case 'facebook':
      return 'Facebook User';
    case 'email':
      return 'MoodShift User';
  }
}
