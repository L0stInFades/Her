'use client';

import { useState, useCallback } from 'react';
import { User, Bot, Copy, Check, Edit2, RotateCcw } from 'lucide-react';
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
  onEdit?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
  isLastMessage?: boolean;
}

export function ChatMessageEnhanced({
  message,
  isStreaming = false,
  onEdit,
  onRegenerate,
  isLastMessage = false,
}: ChatMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const isUser = message.role === 'user';

  const copyToClipboard = useCallback(async (text: string, codeId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (codeId) {
        setCopiedCode(codeId);
        setTimeout(() => setCopiedCode(null), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  const handleSaveEdit = () => {
    if (onEdit && editedContent.trim() !== message.content) {
      onEdit(message.id, editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  return (
    <div
      className={clsx(
        'group relative flex gap-4 px-4 py-6 transition-colors duration-250 animate-fade-in',
        isUser
          ? 'bg-warm-50 dark:bg-warm-900/30'
          : 'bg-white dark:bg-warm-900/10'
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-250',
          'hover:scale-110',
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
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with actions */}
        <div className="mb-2 flex items-center gap-2">
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

          {/* Message Actions */}
          {!isStreaming && (
            <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity duration-250 group-hover:opacity-100">
              {!isUser && onRegenerate && isLastMessage && (
                <button
                  onClick={() => onRegenerate(message.id)}
                  className="rounded-lg p-1.5 text-warm-500 transition-all duration-250 hover:bg-warm-200 hover:text-jade-600 dark:text-warm-400 dark:hover:bg-warm-700 dark:hover:text-jade-400"
                  title="Regenerate"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              {isUser && onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg p-1.5 text-warm-500 transition-all duration-250 hover:bg-warm-200 hover:text-jade-600 dark:text-warm-400 dark:hover:bg-warm-700 dark:hover:text-jade-400"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Message Content */}
        {isEditing ? (
          <div className="flex-1">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSaveEdit();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              className="w-full rounded-xl border-2 border-jade-300 bg-white px-3 py-2 text-warm-900 focus:border-jade-500 focus:outline-none focus:ring-2 focus:ring-jade-100 dark:border-jade-700 dark:bg-warm-800 dark:text-warm-50 dark:focus:ring-jade-900/20"
              rows={4}
              autoFocus
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="rounded-lg bg-jade-500 px-3 py-1.5 text-sm font-medium text-white transition-all duration-250 hover:bg-jade-600"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="rounded-lg bg-warm-200 px-3 py-1.5 text-sm font-medium text-warm-700 transition-all duration-250 hover:bg-warm-300 dark:bg-warm-700 dark:text-warm-300 dark:hover:bg-warm-600"
              >
                Cancel
              </button>
              <span className="ml-auto flex items-center text-xs text-warm-500 dark:text-warm-400">
                Press ⌘↵ to save
              </span>
            </div>
          </div>
        ) : isUser ? (
          <p className="text-warm-700 dark:text-warm-300 whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-warm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeSanitize]}
              components={{
                // Custom code block styling with copy button
                pre: ({ node, children, className, ...props }) => {
                  const codeElement = (children as React.ReactNode[])[0] as React.ReactElement;
                  const codeString = codeElement?.props?.children || '';
                  const language = className?.replace(/language-/, '') || 'code';
                  const codeId = `code-${message.id}-${Math.random().toString(36).substr(2, 9)}`;

                  return (
                    <div className="group/code relative my-4">
                      <div className="flex items-center justify-between rounded-t-xl bg-warm-900 px-4 py-2 dark:bg-warm-950">
                        <span className="text-xs font-medium text-warm-400 dark:text-warm-500">
                          {language}
                        </span>
                        <button
                          onClick={() => copyToClipboard(String(codeString), codeId)}
                          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-warm-400 transition-all duration-250 hover:bg-warm-800 hover:text-warm-200 dark:hover:bg-warm-800"
                        >
                          {copiedCode === codeId ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre
                        className="overflow-x-auto rounded-b-xl bg-warm-900 p-4 dark:bg-warm-950"
                        {...props}
                      >
                        {children}
                      </pre>
                    </div>
                  );
                },
                code: ({ node, className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code
                        className="rounded-lg bg-warm-200 px-1.5 py-0.5 text-sm font-medium transition-all duration-250 hover:bg-warm-300 dark:bg-warm-800 dark:hover:bg-warm-700"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return <code className={className} {...props}>{children}</code>;
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
                    className="mb-4 mt-6 text-2xl font-bold text-warm-900 dark:text-warm-50"
                    {...props}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ node, children, ...props }) => (
                  <h2
                    className="mb-3 mt-5 text-xl font-bold text-warm-900 dark:text-warm-50"
                    {...props}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ node, children, ...props }) => (
                  <h3
                    className="mb-2 mt-4 text-lg font-semibold text-warm-900 dark:text-warm-50"
                    {...props}
                  >
                    {children}
                  </h3>
                ),
                // Custom link styling
                a: ({ node, children, href, ...props }) => (
                  <a
                    href={href}
                    className="inline-flex items-center gap-0.5 text-jade-600 underline underline-offset-4 transition-all duration-250 hover:text-jade-700 hover:underline-offset-2 dark:text-jade-400 dark:hover:text-jade-300"
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
                // Table styling
                table: ({ node, children, ...props }) => (
                  <div className="my-4 overflow-x-auto rounded-xl border border-warm-200 dark:border-warm-700">
                    <table className="min-w-full" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ node, children, ...props }) => (
                  <thead className="bg-warm-50 dark:bg-warm-800" {...props}>
                    {children}
                  </thead>
                ),
                th: ({ node, children, ...props }) => (
                  <th className="px-4 py-2 text-left text-sm font-semibold text-warm-900 dark:text-warm-50" {...props}>
                    {children}
                  </th>
                ),
                td: ({ node, children, ...props }) => (
                  <td className="border-t border-warm-200 px-4 py-2 text-sm text-warm-700 dark:border-warm-700 dark:text-warm-300" {...props}>
                    {children}
                  </td>
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
