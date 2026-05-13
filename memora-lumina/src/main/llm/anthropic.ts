import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage, LLMProvider, StreamHandlers } from './provider';

const FAST_VALIDATION_MODEL = 'claude-haiku-4-5-20251001';

function makeClient(apiKey: string, timeoutMs: number = 60000): Anthropic {
  return new Anthropic({ apiKey, timeout: timeoutMs });
}

function friendlyError(err: unknown): string {
  if (err instanceof Anthropic.APIError) {
    if (err.status === 401) return 'Your API key is invalid or expired.';
    if (err.status === 403) return 'Your API key does not have permission for this operation.';
    if (err.status === 429) return 'Rate limit reached. Please wait a moment and try again.';
    if (err.status === 500 || err.status === 503) return 'Anthropic servers are having trouble. Please retry in a moment.';
    if (err.status === 400) return `Request rejected: ${err.message}`;
    return err.message || 'An API error occurred.';
  }
  if (err instanceof Error) {
    if (/ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT/.test(err.message)) {
      return 'Cannot reach Anthropic. Check your internet connection.';
    }
    return err.message;
  }
  return 'An unknown error occurred.';
}

export const anthropicProvider: LLMProvider = {
  async validateKey(apiKey) {
    if (!apiKey || !apiKey.trim()) return { valid: false, error: 'API key is empty.' };
    try {
      const client = makeClient(apiKey.trim(), 15000);
      await client.messages.create({
        model: FAST_VALIDATION_MODEL,
        max_tokens: 8,
        messages: [{ role: 'user', content: 'ping' }],
      });
      return { valid: true };
    } catch (err) {
      return { valid: false, error: friendlyError(err) };
    }
  },

  async streamChat({ apiKey, model, system, messages, temperature, maxTokens, abortSignal, handlers }) {
    const client = makeClient(apiKey);
    let fullText = '';
    let inputTokens = 0;
    let outputTokens = 0;
    try {
      const stream = await client.messages.stream(
        {
          model,
          max_tokens: maxTokens,
          temperature,
          system: system || undefined,
          messages: messages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        },
        { signal: abortSignal },
      );

      stream.on('text', (delta: string) => {
        fullText += delta;
        handlers.onChunk(delta);
      });

      const finalMsg = await stream.finalMessage();
      if (finalMsg.usage) {
        inputTokens = finalMsg.usage.input_tokens || 0;
        outputTokens = finalMsg.usage.output_tokens || 0;
      }
      handlers.onEnd(fullText, inputTokens + outputTokens);
    } catch (err) {
      if (abortSignal.aborted) {
        handlers.onEnd(fullText, inputTokens + outputTokens);
        return;
      }
      handlers.onError(new Error(friendlyError(err)));
    }
  },

  async completeOnce({ apiKey, model, system, messages, temperature, maxTokens, abortSignal }) {
    const client = makeClient(apiKey);
    try {
      const resp = await client.messages.create(
        {
          model,
          max_tokens: maxTokens,
          temperature,
          system: system || undefined,
          messages: messages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        },
        { signal: abortSignal },
      );
      const text = resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('');
      return text;
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  },
};

export type { ChatMessage, StreamHandlers };
