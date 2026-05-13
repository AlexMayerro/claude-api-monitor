export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamHandlers {
  onChunk: (chunk: string) => void;
  onEnd: (fullText: string, tokensUsed: number) => void;
  onError: (error: Error) => void;
}

export interface LLMProvider {
  validateKey(apiKey: string): Promise<{ valid: boolean; error?: string }>;
  streamChat(params: {
    apiKey: string;
    model: string;
    system: string;
    messages: ChatMessage[];
    temperature: number;
    maxTokens: number;
    abortSignal: AbortSignal;
    handlers: StreamHandlers;
  }): Promise<void>;
  completeOnce(params: {
    apiKey: string;
    model: string;
    system: string;
    messages: ChatMessage[];
    temperature: number;
    maxTokens: number;
    abortSignal?: AbortSignal;
  }): Promise<string>;
}
