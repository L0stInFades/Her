'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Settings, LogOut, Info, Maximize2, Minimize2 } from 'lucide-react';
import { useChatStore, useAuthStore } from '@/lib/store';
import { ConversationSidebarEnhanced } from '@/components/chat/ConversationSidebar.enhanced';
import { MessageListEnhanced } from '@/components/chat/MessageList.enhanced';
import { ChatInputEnhanced } from '@/components/chat/ChatInput.enhanced';
import { ModelSelector } from '@/components/chat/ModelSelector';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useToast } from '@/components/ui/Toast';
import { useChatShortcuts } from '@/hooks/useKeyboardShortcuts';
import { api } from '@/lib/api';
import { clsx } from 'clsx';

export default function ChatPageEnhanced() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { success, error } = useToast();
  const {
    currentConversation,
    conversations,
    messages,
    isStreaming,
    sidebarOpen,
    setSidebarOpen,
    loadConversations,
    createConversation,
    deleteConversation,
    setCurrentConversation,
    sendMessage,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const init = async () => {
      // Check authentication - restore from localStorage first
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        router.push('/login');
        return;
      }

      // Validate session with server
      try {
        await useAuthStore.getState().checkSession();
      } catch {
        // checkSession handles cleanup internally
      }

      // Re-check after session validation
      if (!useAuthStore.getState().user) {
        router.push('/login');
        return;
      }

      // Load conversations
      try {
        await loadConversations();
        setIsLoading(false);
        // Use getState() to avoid stale closure
        if (useChatStore.getState().conversations.length === 0) {
          handleNewConversation();
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
        error('Failed to load conversations');
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Keyboard shortcuts
  useChatShortcuts({
    onNewChat: handleNewConversation,
    onToggleSidebar: () => setSidebarOpen(!sidebarOpen),
    onFocusInput: () => inputRef.current?.focus(),
  });

  function handleNewConversation() {
    createConversation()
      .then(() => success('New conversation created'))
      .catch((err) => {
        console.error('Failed to create conversation:', err);
        error('Failed to create conversation');
      });
  }

  function handleSelectConversation(conversationId: string) {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      setSelectedModel(conversation.model);
    }
  }

  function handleDeleteConversation(conversationId: string) {
    deleteConversation(conversationId)
      .then(() => {
        success('Conversation deleted');
        // If we deleted the current conversation, create a new one
        if (currentConversation?.id === conversationId) {
          if (conversations.length > 1) {
            const remainingConversations = conversations.filter(
              (c) => c.id !== conversationId
            );
            setCurrentConversation(remainingConversations[0]);
          } else {
            handleNewConversation();
          }
        }
      })
      .catch((err) => {
        console.error('Failed to delete conversation:', err);
        error('Failed to delete conversation');
      });
  }

  function handleRenameConversation(conversationId: string, newTitle: string) {
    api
      .patch(`/conversations/${conversationId}`, { title: newTitle })
      .then(() => {
        success('Conversation renamed');
        return loadConversations();
      })
      .catch((err) => {
        console.error('Failed to rename conversation:', err);
        error('Failed to rename conversation');
      });
  }

  function handleSendMessage(content: string) {
    if (!currentConversation) {
      handleNewConversation();
      return;
    }

    sendMessage(content)
      .then(() => {
        // Message sent successfully
      })
      .catch((err) => {
        console.error('Failed to send message:', err);
        error(err instanceof Error ? err.message : 'Failed to send message');
      });
  }

  function handleStopGeneration() {
    // TODO: Implement stop generation
    setSidebarOpen(false); // Placeholder
  }

  function handleEditMessage(messageId: string, newContent: string) {
    // TODO: Implement message editing
    console.log('Edit message:', messageId, newContent);
  }

  function handleRegenerateMessage(messageId: string) {
    // TODO: Implement message regeneration
    console.log('Regenerate message:', messageId);
  }

  async function handleLogout() {
    await logout();
    router.push('/');
    success('Logged out successfully');
  }

  function handleModelChange(modelId: string) {
    setSelectedModel(modelId);
    if (currentConversation) {
      api
        .patch(`/conversations/${currentConversation.id}`, { model: modelId })
        .then(() => {
          success(`Model changed to ${MODELS.find((m) => m.id === modelId)?.name}`);
          // Reload conversation to update model
          const updatedConversation = {
            ...currentConversation,
            model: modelId,
          };
          setCurrentConversation(updatedConversation);
        })
        .catch((err) => {
          console.error('Failed to change model:', err);
          error('Failed to change model');
        });
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-warm-50 dark:bg-warm-950">
        <div className="text-center">
          <div className="mb-6 inline-flex h-16 w-16 animate-spin items-center justify-center rounded-2xl bg-jade-100 text-jade-600 dark:bg-jade-900/20 dark:text-jade-400">
            <svg
              className="h-8 w-8 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <p className="text-warm-600 dark:text-warm-400 animate-pulse">Loading Her...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex bg-warm-50 dark:bg-warm-950 transition-all duration-350',
        isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'h-screen'
      )}
    >
      {/* Sidebar */}
      <ConversationSidebarEnhanced
        conversations={conversations}
        currentConversationId={currentConversation?.id || null}
        isOpen={sidebarOpen}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header
          className={clsx(
            'flex items-center justify-between border-b border-warm-200 bg-white px-4 py-3 transition-all duration-250 dark:border-warm-700 dark:bg-warm-900',
            'animate-slide-down'
          )}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-warm-600 transition-all duration-250 hover:bg-warm-100 lg:hidden dark:text-warm-400 dark:hover:bg-warm-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <h1
                className={clsx(
                  'text-lg font-semibold text-warm-900 transition-all duration-250 dark:text-warm-50',
                  !isFullscreen && 'hidden sm:block'
                )}
              >
                {currentConversation?.title || 'New Conversation'}
              </h1>
              <ModelSelector
                value={selectedModel}
                onChange={handleModelChange}
                disabled={isStreaming}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Keyboard shortcuts hint */}
            <button
              className="hidden sm:flex rounded-lg p-2 text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800 items-center gap-1 text-xs transition-all duration-250"
              title="Keyboard shortcuts: ⌘K - Search, ⌘N - New chat, ⌘B - Toggle sidebar"
            >
              <Info className="h-4 w-4" />
              <span>Shortcuts</span>
            </button>

            <ThemeToggle />

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-lg p-2 text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800 transition-all duration-250"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>

            <button
              onClick={() => router.push('/settings')}
              className="rounded-lg p-2 text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800 transition-all duration-250"
            >
              <Settings className="h-5 w-5" />
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800 transition-all duration-250"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <MessageListEnhanced
            messages={messages}
            isStreaming={isStreaming}
            onEditMessage={handleEditMessage}
            onRegenerateMessage={handleRegenerateMessage}
          />
        </div>

        {/* Input */}
        <ChatInputEnhanced
          ref={inputRef}
          onSend={handleSendMessage}
          onStop={handleStopGeneration}
          disabled={isStreaming || !currentConversation}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}

const MODELS = [
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
];
