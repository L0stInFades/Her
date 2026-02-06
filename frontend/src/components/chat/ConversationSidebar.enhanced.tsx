'use client';

import { useState, useMemo } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, X, Check, Search, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { format, isToday, isYesterday, subDays } from 'date-fns';
import type { Conversation } from '@/lib/types';

interface ConversationSidebarEnhancedProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  isOpen: boolean;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClose?: () => void;
}

export function ConversationSidebarEnhanced({
  conversations,
  currentConversationId,
  isOpen,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onClose,
}: ConversationSidebarEnhancedProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const filtered = conversations.filter((conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: Record<string, Conversation[]> = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    filtered.forEach((conv) => {
      const date = new Date(conv.updatedAt);
      if (isToday(date)) {
        groups.Today.push(conv);
      } else if (isYesterday(date)) {
        groups.Yesterday.push(conv);
      } else if (date > subDays(new Date(), 7)) {
        groups['Previous 7 Days'].push(conv);
      } else {
        groups.Older.push(conv);
      }
    });

    return groups;
  }, [conversations, searchQuery]);

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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 transform border-r border-warm-200 bg-white dark:border-warm-700 dark:bg-warm-900 lg:relative lg:z-auto',
          'transition-transform duration-350 ease-her-smooth',
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
              className="lg:hidden rounded-lg p-2 text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800 transition-colors duration-250"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-2 border-warm-200 bg-warm-50 py-2.5 pl-9 pr-4 text-sm text-warm-900 placeholder:text-warm-400 focus:border-jade-500 focus:outline-none focus:ring-2 focus:ring-jade-100 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-jade-400 dark:focus:ring-jade-900/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 dark:hover:text-warm-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* New Conversation Button */}
          <div className="px-3 pb-3">
            <button
              onClick={onNewConversation}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-warm-300 px-4 py-3 text-left text-warm-600 transition-all duration-250 hover:border-jade-500 hover:bg-jade-50 hover:text-jade-700 hover:shadow-soft dark:border-warm-700 dark:text-warm-400 dark:hover:border-jade-400 dark:hover:bg-jade-900/20 dark:hover:text-jade-300"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">New conversation</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {Object.entries(groupedConversations).map(([groupName, groupConversations]) =>
              groupConversations.length > 0 ? (
                <div key={groupName} className="mb-4">
                  {/* Date Group Header */}
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <Calendar className="h-3.5 w-3.5 text-warm-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-warm-500 dark:text-warm-400">
                      {groupName}
                    </span>
                  </div>

                  {/* Conversations in this group */}
                  <div className="space-y-0.5">
                    {groupConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onMouseEnter={() => setHoveredId(conversation.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={clsx(
                          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-250',
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
                          <div className="flex items-center gap-0.5 animate-fade-in">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(conversation);
                              }}
                              className="rounded-lg p-1.5 text-warm-500 hover:bg-warm-200 hover:text-warm-700 dark:text-warm-400 dark:hover:bg-warm-700 dark:hover:text-warm-300 transition-all duration-250"
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
                              className="rounded-lg p-1.5 text-warm-500 hover:bg-red-100 hover:text-red-600 dark:text-warm-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-250"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Edit mode buttons */}
                        {editingId === conversation.id && (
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEdit(conversation.id);
                              }}
                              className="rounded-lg p-1.5 text-jade-600 hover:bg-jade-100 dark:text-jade-400 dark:hover:bg-jade-900/20 transition-all duration-250"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="rounded-lg p-1.5 text-warm-500 hover:bg-warm-200 hover:text-warm-700 dark:text-warm-400 dark:hover:bg-warm-700 dark:hover:text-warm-300 transition-all duration-250"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}

            {conversations.length === 0 && (
              <div className="py-8 text-center text-sm text-warm-500 dark:text-warm-400">
                No conversations yet
              </div>
            )}

            {conversations.length > 0 && searchQuery && Object.values(groupedConversations).every((g) => g.length === 0) && (
              <div className="py-8 text-center text-sm text-warm-500 dark:text-warm-400">
                No conversations found
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
