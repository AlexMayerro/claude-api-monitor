import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Brain } from 'lucide-react';
import { cn, formatTimestamp } from '@renderer/lib/utils';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import type { Message } from '@shared/types';
import { MemoryIndicator } from './MemoryIndicator';

interface Props {
  message: Message;
  streaming?: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
  bubbleStyle: 'bubbles' | 'flat' | 'minimal';
  showTimestamp: boolean;
}

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const theme = useSettingsStore((s) => s.settings.code_theme);
  const style = theme === 'monokai' || theme === 'dracula' ? atomDark : oneDark;
  return (
    <div className="relative my-2 rounded-md overflow-hidden border border-border-subtle">
      <div className="flex items-center justify-between bg-surface-elevated px-3 py-1.5 text-[11px] text-text-muted">
        <span className="font-mono">{language || 'text'}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex items-center gap-1 hover:text-text-primary"
          aria-label="Copy code"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter language={language || 'text'} style={style as any} customStyle={{ margin: 0, padding: '12px 14px', fontSize: 13 }} wrapLongLines>
        {value.replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}

export const MessageBubble: React.FC<Props> = ({ message, streaming, density, bubbleStyle, showTimestamp }) => {
  const isUser = message.role === 'user';
  const showMemoryIndicator = useSettingsStore((s) => s.settings.show_memory_indicators);
  const timestampFormat = useSettingsStore((s) => s.settings.timestamp_format);
  const verticalPad = { compact: 'py-2', comfortable: 'py-3', spacious: 'py-4' }[density];

  const bubbleClasses = (() => {
    if (bubbleStyle === 'minimal') return '';
    if (bubbleStyle === 'flat') {
      return isUser ? 'bg-accent text-white rounded-md' : 'bg-surface-card text-text-primary rounded-md';
    }
    return isUser
      ? 'bg-accent text-white rounded-2xl rounded-br-md shadow-card'
      : 'bg-surface-card text-text-primary rounded-2xl rounded-bl-md shadow-card border border-border-subtle';
  })();

  return (
    <div className={cn('group flex w-full', isUser ? 'justify-end' : 'justify-start', verticalPad)}>
      <div className={cn('flex gap-3 max-w-[85%]', isUser ? 'flex-row-reverse' : '')}>
        {!isUser && bubbleStyle !== 'minimal' && (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5">
            <Brain size={14} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className={cn(bubbleClasses, bubbleStyle === 'minimal' ? '' : 'px-4 py-2.5')}>
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            ) : (
              <div className="markdown text-[14px]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...rest }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const text = String(children ?? '');
                      const isBlock = !!match || text.includes('\n');
                      if (!isBlock) {
                        return (
                          <code className={className} {...rest}>
                            {children}
                          </code>
                        );
                      }
                      return <CodeBlock language={match?.[1] || ''} value={text} />;
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          onClick={(e) => {
                            e.preventDefault();
                            if (href) window.memora.openExternal(href);
                          }}
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {streaming && (
                  <span className="inline-block w-2 h-4 bg-text-primary/70 align-middle ml-0.5 animate-cursor-blink" />
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-1 px-1">
            {showMemoryIndicator && !isUser && message.injected_memory_ids && message.injected_memory_ids.length > 0 ? (
              <MemoryIndicator memoryIds={message.injected_memory_ids} />
            ) : (
              <span />
            )}
            <span
              className={cn(
                'text-[11px] text-text-muted',
                showTimestamp ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity',
              )}
            >
              {formatTimestamp(message.created_at, timestampFormat)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
