'use client';

import { useState, useRef, useEffect, useImperativeHandle, forwardRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Mic, StopCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface ChatInputEnhancedProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

export const ChatInputEnhanced = forwardRef<HTMLTextAreaElement, ChatInputEnhancedProps>(function ChatInputEnhanced({
  onSend,
  onStop,
  disabled = false,
  isStreaming = false,
  placeholder = 'Message Her...',
}, ref) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => textareaRef.current!, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isStreaming) {
        handleStop();
      } else {
        handleSend();
      }
    }
  };

  const characterCount = message.length;
  const isNearLimit = characterCount > 4000;
  const isAtLimit = characterCount >= 6000;

  return (
    <div className="border-t border-warm-200 bg-white dark:border-warm-700 dark:bg-warm-900">
      <div className="mx-auto max-w-4xl p-4">
        <div
          className={clsx(
            'relative flex items-end gap-3 rounded-2xl border-2 bg-white p-3 transition-all duration-250',
            disabled || isStreaming
              ? 'border-warm-200 opacity-75'
              : 'border-warm-200 focus-within:border-jade-500 focus-within:ring-4 focus-within:ring-jade-100',
            'dark:border-warm-700 dark:bg-warm-800 dark:focus-within:border-jade-400 dark:focus-within:ring-jade-900/20'
          )}
        >
          {/* Attachment button (placeholder for future) */}
          <button
            className={clsx(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-250',
              'text-warm-400 hover:text-warm-600 hover:bg-warm-100',
              'dark:text-warm-500 dark:hover:text-warm-300 dark:hover:bg-warm-700',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            disabled={disabled}
            title="Attach files (coming soon)"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Input textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              if (!isAtLimit) {
                setMessage(e.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={clsx(
              'flex-1 resize-none overflow-hidden bg-transparent text-warm-900 placeholder:text-warm-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              'dark:text-warm-50 dark:placeholder:text-warm-500',
              'max-h-[200px] min-h-[24px]'
            )}
          />

          {/* Character count warning */}
          {isNearLimit && (
            <div
              className={clsx(
                'absolute bottom-2 right-16 text-xs',
                isAtLimit
                  ? 'text-red-500'
                  : 'text-warm-500 dark:text-warm-400'
              )}
            >
              {characterCount}/6000
            </div>
          )}

          {/* Action button */}
          {isStreaming && onStop ? (
            <button
              onClick={handleStop}
              className={clsx(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-250',
                'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg'
              )}
              title="Stop generation (Esc)"
            >
              <StopCircle className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={disabled || !message.trim() || isAtLimit}
              className={clsx(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-250',
                'focus:outline-none focus:ring-2 focus:ring-jade-500 focus:ring-offset-2',
                message.trim() && !disabled && !isAtLimit
                  ? 'bg-jade-500 text-white hover:bg-jade-600 hover:scale-105 shadow-md hover:shadow-jade'
                  : 'bg-warm-200 text-warm-400 cursor-not-allowed dark:bg-warm-700 dark:text-warm-500'
              )}
              title="Send message (Enter)"
            >
              <Send className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-2 flex items-center justify-between text-xs text-warm-500 dark:text-warm-400">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">
              Press <kbd className="rounded bg-warm-200 px-1.5 py-0.5 dark:bg-warm-800">Enter</kbd> to send
            </span>
            <span className="hidden sm:inline">
              <kbd className="rounded bg-warm-200 px-1.5 py-0.5 dark:bg-warm-800">Shift + Enter</kbd> for new line
            </span>
            {isStreaming && (
              <span className="flex items-center gap-1 text-jade-600 dark:text-jade-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jade-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-jade-500"></span>
                </span>
                Her is typing...
              </span>
            )}
          </div>
          <span>Her can make mistakes. Consider checking important information.</span>
        </div>
      </div>
    </div>
  );
});
