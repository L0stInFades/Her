'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { clsx } from 'clsx';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Message Her...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-warm-200 bg-white p-4 dark:border-warm-700 dark:bg-warm-900">
      <div className="mx-auto max-w-4xl">
        <div className="relative flex items-end gap-3 rounded-2xl border-2 border-warm-200 bg-white p-3 transition-all duration-200 focus-within:border-jade-500 focus-within:ring-4 focus-within:ring-jade-100 dark:border-warm-700 dark:bg-warm-800 dark:focus-within:border-jade-400 dark:focus-within:ring-jade-900/20">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none overflow-hidden bg-transparent text-warm-900 placeholder:text-warm-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-warm-50 dark:placeholder:text-warm-500"
            style={{ maxHeight: '200px', minHeight: '24px' }}
          />

          <button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className={clsx(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-jade-500 focus:ring-offset-2',
              message.trim() && !disabled
                ? 'bg-jade-500 text-white hover:bg-jade-600 shadow-md hover:shadow-lg'
                : 'bg-warm-200 text-warm-400 cursor-not-allowed dark:bg-warm-700 dark:text-warm-500'
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-warm-500 dark:text-warm-400">
          Her can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
