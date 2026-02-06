'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, X, Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { Conversation } from '@/lib/types';

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  isOpen: boolean;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClose?: () => void;
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  isOpen,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onClose,
}: ConversationSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const handleSaveEdit = (conversationId: string) => {
    const newTitle = editingTitle.trim() || 'New Conversation';
    onRenameConversation(conversationId, newTitle);
    setEditingId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 transform border-r border-warm-200 bg-white dark:border-warm-700 dark:bg-warm-900 lg:relative lg:z-auto',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-warm-200 p-4 dark:border-warm-700">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-jade-400 to-jade-600 text-white shadow-jade">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="text-xl font-semibold text-warm-900 dark:text-warm-50">
                Her
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden rounded-lg p-2 text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* New Conversation Button */}
          <div className="p-3">
            <button
              onClick={onNewConversation}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-warm-300 px-4 py-3 text-left text-warm-600 transition-all duration-200 hover:border-jade-500 hover:bg-jade-50 hover:text-jade-700 dark:border-warm-700 dark:text-warm-400 dark:hover:border-jade-400 dark:hover:bg-jade-900/20 dark:hover:text-jade-300"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">New conversation</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {conversations.length === 0 ? (
              <div className="py-8 text-center text-sm text-warm-500 dark:text-warm-400">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onMouseEnter={() => setHoveredId(conversation.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={clsx(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                      currentConversationId === conversation.id
                        ? 'bg-jade-100 text-jade-900 dark:bg-jade-900/30 dark:text-jade-100'
                        : 'text-warm-700 hover:bg-warm-100 dark:text-warm-300 dark:hover:bg-warm-800'
                    )}
                  >
                    <button
                      onClick={() => onSelectConversation(conversation.id)}
                      className="flex flex-1 items-center gap-3 overflow-hidden"
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      {editingId === conversation.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit(conversation.id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="truncate text-sm font-medium">
                          {conversation.title}
                        </span>
                      )}
                    </button>

                    {/* Action buttons */}
                    {hoveredId === conversation.id && editingId !== conversation.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(conversation);
                          }}
                          className="rounded-lg p-1.5 text-warm-500 hover:bg-warm-200 hover:text-warm-700 dark:text-warm-400 dark:hover:bg-warm-700 dark:hover:text-warm-300"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                'Delete this conversation? This action cannot be undone.'
                              )
                            ) {
                              onDeleteConversation(conversation.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-warm-500 hover:bg-red-100 hover:text-red-600 dark:text-warm-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Edit mode buttons */}
                    {editingId === conversation.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(conversation.id);
                          }}
                          className="rounded-lg p-1.5 text-jade-600 hover:bg-jade-100 dark:text-jade-400 dark:hover:bg-jade-900/20"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                          className="rounded-lg p-1.5 text-warm-500 hover:bg-warm-200 hover:text-warm-700 dark:text-warm-400 dark:hover:bg-warm-700 dark:hover:text-warm-300"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-warm-200 p-4 dark:border-warm-700">
            <div className="text-xs text-warm-500 dark:text-warm-400">
              <p>&copy; 2024 Her</p>
              <p className="mt-1">Your warm AI companion</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
