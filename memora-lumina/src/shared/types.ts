export type MemoryLayer = 'core_identity' | 'long_term' | 'mid_term' | 'short_term';
export type MessageRole = 'user' | 'assistant' | 'system';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_pinned: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  tokens_used: number;
  injected_memory_ids?: string[];
}

export interface Memory {
  id: string;
  layer: MemoryLayer;
  content: string;
  summary: string;
  importance: number;
  tags: string[];
  source_conversation_id: string | null;
  source_message_id: string | null;
  emotional_context: string | null;
  created_at: string;
  last_accessed: string;
  access_count: number;
  is_active: number;
}

export interface UserProfile {
  name: string;
  primary_use: string;
  initial_context: string;
  created_at: string;
}

export interface MemoryFilters {
  layers?: MemoryLayer[];
  minImportance?: number;
  maxImportance?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'newest' | 'oldest' | 'importance';
  limit?: number;
  offset?: number;
}

export interface MemorySearchResult {
  memory: Memory;
  matchCount: number;
  snippet: string;
}

export interface MemoryStats {
  total: number;
  byLayer: Record<MemoryLayer, number>;
  recentlyAddedCount: number;
}

export interface StreamChunkEvent {
  conversationId: string;
  messageId: string;
  chunk: string;
}

export interface StreamEndEvent {
  conversationId: string;
  messageId: string;
  fullText: string;
  injectedMemoryIds: string[];
}

export interface StreamErrorEvent {
  conversationId: string;
  message: string;
}

export interface SendMessageRequest {
  conversationId: string;
  message: string;
  manualContextMemoryIds?: string[];
}

export interface AppSettings {
  // Appearance
  theme: ThemeMode;
  accent_color: string;
  font_size: 'small' | 'medium' | 'large' | 'xl';
  font_family: 'inter' | 'system' | 'mono';
  chat_bubble_style: 'bubbles' | 'flat' | 'minimal';
  message_density: 'compact' | 'comfortable' | 'spacious';
  sidebar_position: 'left' | 'right';
  sidebar_width: number;
  animation_speed: 'full' | 'reduced' | 'none';
  window_opacity: number;
  // Chat
  default_model: string;
  temperature: number;
  max_response_length: 'short' | 'medium' | 'long' | 'max';
  streaming: boolean;
  send_shortcut: 'enter' | 'ctrl_enter';
  auto_scroll: boolean;
  show_timestamps: boolean;
  timestamp_format: '12h' | '24h';
  code_theme: 'github-dark' | 'monokai' | 'one-dark' | 'dracula';
  show_token_count: boolean;
  // Memory
  auto_capture_memories: boolean;
  importance_threshold: number;
  context_injection: boolean;
  max_injected_memories: number;
  max_injection_tokens: number;
  show_memory_indicators: boolean;
  auto_consolidation: 'every_chat' | 'daily' | 'weekly' | 'manual';
  memory_export_format: 'json' | 'markdown' | 'plain';
  // Memory Stream
  highlight_color: string;
  auto_jump_sensitivity: 'high' | 'medium' | 'low' | 'off';
  stream_default_sort: 'newest' | 'oldest' | 'importance';
  show_importance_dots: boolean;
  show_layer_badges: boolean;
  stream_default_range: 'all' | '30d' | '7d';
  stream_font_size: number;
  // Notifications
  memory_saved_toast: boolean;
  sound_effects: boolean;
  toast_position: 'top-right' | 'bottom-right';
  toast_duration: number;
  memory_count_badge: boolean;
  // Privacy
  auto_lock: 'never' | '5m' | '15m' | '30m' | '1h';
  require_password: boolean;
  api_key_display: 'show' | 'hide';
  // Tabs/Layout
  remember_layout: boolean;
  default_split_direction: 'horizontal' | 'vertical';
  max_open_tabs: number;
  close_tab_confirmation: boolean;
  open_memory_stream_on_start: boolean;
  // Keyboard shortcuts (serialized JSON map)
  keyboard_shortcuts: Record<string, string>;
  // Advanced
  api_timeout: number;
  retry_failed: boolean;
  max_retries: number;
  debug_mode: boolean;
  log_level: 'errors' | 'warnings' | 'all';
  custom_system_prompt: string;
  proxy_host: string;
  proxy_port: string;
  hardware_acceleration: boolean;
  // Internal
  onboarding_completed: boolean;
  api_key: string;
  ai_provider: 'anthropic';
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accent_color: '#3B82F6',
  font_size: 'medium',
  font_family: 'inter',
  chat_bubble_style: 'bubbles',
  message_density: 'comfortable',
  sidebar_position: 'left',
  sidebar_width: 280,
  animation_speed: 'full',
  window_opacity: 100,
  default_model: 'claude-sonnet-4-6',
  temperature: 0.7,
  max_response_length: 'medium',
  streaming: true,
  send_shortcut: 'enter',
  auto_scroll: true,
  show_timestamps: false,
  timestamp_format: '12h',
  code_theme: 'github-dark',
  show_token_count: false,
  auto_capture_memories: true,
  importance_threshold: 3,
  context_injection: true,
  max_injected_memories: 6,
  max_injection_tokens: 800,
  show_memory_indicators: true,
  auto_consolidation: 'daily',
  memory_export_format: 'json',
  highlight_color: '#FBBF24',
  auto_jump_sensitivity: 'medium',
  stream_default_sort: 'newest',
  show_importance_dots: true,
  show_layer_badges: true,
  stream_default_range: 'all',
  stream_font_size: 14,
  memory_saved_toast: true,
  sound_effects: false,
  toast_position: 'bottom-right',
  toast_duration: 3,
  memory_count_badge: true,
  auto_lock: 'never',
  require_password: false,
  api_key_display: 'hide',
  remember_layout: true,
  default_split_direction: 'vertical',
  max_open_tabs: 10,
  close_tab_confirmation: false,
  open_memory_stream_on_start: false,
  keyboard_shortcuts: {
    new_chat: 'Ctrl+N',
    search_memory: 'Ctrl+Shift+F',
    toggle_memory_stream: 'Ctrl+M',
    toggle_sidebar: 'Ctrl+B',
    split_screen: 'Ctrl+\\',
    open_settings: 'Ctrl+,',
    close_tab: 'Ctrl+W',
    next_tab: 'Ctrl+Tab',
    prev_tab: 'Ctrl+Shift+Tab',
    focus_search: 'Ctrl+K',
    toggle_theme: 'Ctrl+Shift+T',
  },
  api_timeout: 60,
  retry_failed: true,
  max_retries: 3,
  debug_mode: false,
  log_level: 'errors',
  custom_system_prompt: '',
  proxy_host: '',
  proxy_port: '',
  hardware_acceleration: true,
  onboarding_completed: false,
  api_key: '',
  ai_provider: 'anthropic',
};

export const AVAILABLE_MODELS = [
  { id: 'claude-opus-4-7', name: 'Claude Opus 4.7', description: 'Most capable, deepest reasoning' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', description: 'Balanced — fast and intelligent' },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', description: 'Fastest, most efficient' },
];

export const MAX_TOKENS_MAP: Record<AppSettings['max_response_length'], number> = {
  short: 1024,
  medium: 4096,
  long: 8192,
  max: 16384,
};

export interface IPCApi {
  // Chat
  sendMessage: (req: SendMessageRequest) => Promise<{ messageId: string }>;
  stopStream: (conversationId: string) => Promise<void>;
  getConversations: () => Promise<Conversation[]>;
  getMessages: (conversationId: string) => Promise<Message[]>;
  createConversation: () => Promise<Conversation>;
  renameConversation: (id: string, title: string) => Promise<void>;
  togglePinConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;

  // Memory
  getMemories: (filters: MemoryFilters) => Promise<Memory[]>;
  searchMemories: (query: string, filters: MemoryFilters) => Promise<MemorySearchResult[]>;
  deleteMemory: (id: string) => Promise<void>;
  getMemoryStats: () => Promise<MemoryStats>;
  exportMemories: (format: 'json' | 'markdown' | 'plain') => Promise<{ path: string } | null>;
  importMemories: () => Promise<{ imported: number } | null>;
  clearAllMemories: () => Promise<void>;
  injectMemoryToContext: (conversationId: string, memoryId: string) => Promise<void>;

  // Settings
  getSetting: <K extends keyof AppSettings>(key: K) => Promise<AppSettings[K]>;
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  getAllSettings: () => Promise<AppSettings>;

  // Profile
  getProfile: () => Promise<UserProfile | null>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;

  // API key validation
  validateApiKey: (apiKey: string) => Promise<{ valid: boolean; error?: string }>;

  // Window controls
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;
  openExternal: (url: string) => void;

  // Events (renderer subscribes)
  onStreamChunk: (cb: (event: StreamChunkEvent) => void) => () => void;
  onStreamEnd: (cb: (event: StreamEndEvent) => void) => () => void;
  onStreamError: (cb: (event: StreamErrorEvent) => void) => () => void;
  onMemorySaved: (cb: (memory: Memory) => void) => () => void;
  onWindowStateChanged: (cb: (state: { maximized: boolean }) => void) => () => void;
}

declare global {
  interface Window {
    memora: IPCApi;
  }
}
