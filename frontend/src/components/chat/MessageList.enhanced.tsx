'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowDown } from 'lucide-react';
import { ChatMessageEnhanced } from './ChatMessage.enhanced';
import { TypingIndicator } from './TypingIndicator';
import type { Message } from '@/lib/types';
import { clsx } from 'clsx';

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerateMessage?: (messageId: string) => void;
}

export function MessageListEnhanced({
  messages,
  isStreaming = false,
  onEditMessage,
  onRegenerateMessage,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isUserAtBottom || isStreaming) {
      scrollToBottom();
    }
  }, [messages, isStreaming, isUserAtBottom]);

  // Track scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const atBottom = distanceFromBottom < 100;

      setIsUserAtBottom(atBottom);
      setShowScrollButton(!atBottom && messages.length > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsUserAtBottom(true);
    setShowScrollButton(false);
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4">
        {/* Welcome illustration */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse-soft rounded-full bg-gradient-to-br from-jade-400 to-jade-600 opacity-20 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-jade-400 to-jade-600 text-white shadow-jade-lg animate-scale-in">
            <svg
              className="h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
        </div>

        <div className="text-center max-w-md animate-slide-up">
          <h2 className="mb-3 text-2xl font-bold text-warm-900 dark:text-warm-50">
            Start a conversation with Her
          </h2>
          <p className="text-warm-600 dark:text-warm-400 mb-6">
            Ask me anything. I&apos;m here to help you with your questions, ideas, and creative projects.
          </p>

          {/* Suggested prompts */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <SuggestedPrompt text="Explain quantum computing" />
            <SuggestedPrompt text="Write a poem about nature" />
            <SuggestedPrompt text="Help me brainstorm ideas" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((message, index) => (
          <ChatMessageEnhanced
            key={message.id}
            message={message}
            isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
            onEdit={onEditMessage}
            onRegenerate={onRegenerateMessage}
            isLastMessage={index === messages.length - 1}
          />
        ))}

        {/* Typing indicator */}
        {isStreaming && (
          <TypingIndicator />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className={clsx(
            'absolute bottom-4 right-4 z-10',
            'flex h-10 w-10 items-center justify-center rounded-xl',
            'bg-white shadow-soft-lg border border-warm-200',
            'text-warm-600 hover:text-jade-600 hover:shadow-jade',
            'transition-all duration-250 hover:scale-110',
            'dark:bg-warm-800 dark:border-warm-700 dark:text-warm-400 dark:hover:text-jade-400',
            'animate-scale-in'
          )}
          title="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function SuggestedPrompt({ text }: { text: string }) {
  return (
    <button
      className={clsx(
        'rounded-xl border-2 border-warm-200 px-4 py-2 text-sm',
        'text-warm-700 hover:border-jade-500 hover:bg-jade-50 hover:text-jade-700',
        'transition-all duration-250 hover:scale-105',
        'dark:border-warm-700 dark:text-warm-300 dark:hover:border-jade-500 dark:hover:bg-jade-900/20 dark:hover:text-jade-300'
      )}
    >
      {text}
    </button>
  );
}
