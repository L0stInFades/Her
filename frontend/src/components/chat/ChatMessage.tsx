'use client';

import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import { clsx } from 'clsx';
import type { Message } from '@/lib/types';
import 'highlight.js/styles/github-dark.css';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={clsx(
        'group flex gap-4 px-4 py-6 transition-colors duration-200',
        isUser
          ? 'bg-warm-50 dark:bg-warm-900/30'
          : 'bg-white dark:bg-warm-900/10'
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          isUser
            ? 'bg-jade-500 text-white'
            : 'bg-gradient-to-br from-jade-400 to-jade-600 text-white shadow-jade'
        )}
      >
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-semibold text-warm-900 dark:text-warm-50">
            {isUser ? 'You' : 'Her'}
          </span>
          {!isUser && isStreaming && (
            <span className="flex h-4 items-center gap-1">
              <span className="h-1 w-1 animate-bounce rounded-full bg-jade-500 [animation-delay:-0.3s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-jade-500 [animation-delay:-0.15s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-jade-500" />
            </span>
          )}
        </div>

        {isUser ? (
          <p className="text-warm-700 dark:text-warm-300 whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-warm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeSanitize]}
              components={{
                // Custom code block styling
                pre: ({ node, children, ...props }) => (
                  <pre
                    className="my-4 overflow-x-auto rounded-xl bg-warm-900 p-4 dark:bg-warm-950"
                    {...props}
                  >
                    {children}
                  </pre>
                ),
                code: ({ node, className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code
                        className="rounded-lg bg-warm-200 px-1.5 py-0.5 text-sm dark:bg-warm-800"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                // Custom paragraph styling
                p: ({ node, children, ...props }) => (
                  <p
                    className="mb-4 leading-relaxed text-warm-700 dark:text-warm-300"
                    {...props}
                  >
                    {children}
                  </p>
                ),
                // Custom list styling
                ul: ({ node, children, ...props }) => (
                  <ul className="my-4 ml-4 list-disc space-y-2" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ node, children, ...props }) => (
                  <ol className="my-4 ml-4 list-decimal space-y-2" {...props}>
                    {children}
                  </ol>
                ),
                li: ({ node, children, ...props }) => (
                  <li className="text-warm-700 dark:text-warm-300" {...props}>
                    {children}
                  </li>
                ),
                // Custom heading styling
                h1: ({ node, children, ...props }) => (
                  <h1
                    className="mb-4 text-2xl font-bold text-warm-900 dark:text-warm-50"
                    {...props}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ node, children, ...props }) => (
                  <h2
                    className="mb-3 text-xl font-bold text-warm-900 dark:text-warm-50"
                    {...props}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ node, children, ...props }) => (
                  <h3
                    className="mb-2 text-lg font-semibold text-warm-900 dark:text-warm-50"
                    {...props}
                  >
                    {children}
                  </h3>
                ),
                // Custom link styling
                a: ({ node, children, href, ...props }) => (
                  <a
                    href={href}
                    className="text-jade-600 underline underline-offset-4 hover:text-jade-700 dark:text-jade-400 dark:hover:text-jade-300"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                ),
                // Custom blockquote styling
                blockquote: ({ node, children, ...props }) => (
                  <blockquote
                    className="my-4 border-l-4 border-jade-500 pl-4 italic text-warm-700 dark:text-warm-300"
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
