export type StyleMood = 'Warm' | 'Cool' | 'Cinematic' | 'Vintage' | 'Dark' | 'Bright';

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  tags: string[];
  moods: StyleMood[];
  filter: string;
  /** Optional pre/post overlay color baked over the image. */
  overlay?: {
    color: string;
    opacity: number;
    blend: GlobalCompositeOperation;
  };
  /** Sample preview index 0-4 mapped to one of the built-in sample photos. */
  previewIndex: number;
  /** Pro-only style flag. */
  pro?: boolean;
}

export type TabKey = 'discover' | 'library' | 'photos' | 'profile';

export interface RegradedPhoto {
  id: string;
  /** Original photo as a data URL or object URL. */
  originalSrc: string;
  /** The style preset used. */
  styleId: string;
  styleName: string;
  /** Intensity 0-1 used at save time. */
  intensity: number;
  /** ISO timestamp. */
  createdAt: string;
}

export type AuthMethod = 'apple' | 'google' | 'facebook' | 'email';

export type AuthKind = 'none' | 'guest' | 'signed-in';

export interface AuthState {
  kind: AuthKind;
  method?: AuthMethod;
  email?: string;
  name?: string;
}

export type Plan = 'free' | 'pro';

export type ApiProvider = 'xai-grok' | 'openai' | 'anthropic' | 'replicate';

export interface ByokConfig {
  enabled: boolean;
  provider: ApiProvider;
  /** Stored locally only; never sent anywhere from this prototype. */
  apiKey: string;
  /** Optional user keywords appended to the (hidden) base prompt. */
  keywords: string;
}
