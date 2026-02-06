import { create } from 'zustand';
import type { User, AuthStore, ChatStore, Conversation, Message } from './types';
import { api } from './api';

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Auth Store
export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: getStoredUser(),
  isAuthenticated: !!getStoredUser(),

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (credentials) => {
    const response = await api.post<{
      user: User;
    }>('/auth/login', credentials);

    if (response.success && response.data) {
      const { user } = response.data;
      set({ user, isAuthenticated: true });

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
    } else {
      throw new Error(response.error || 'Login failed');
    }
  },

  register: async (data) => {
    const response = await api.post<{
      user: User;
    }>('/auth/register', data);

    if (response.success && response.data) {
      const { user } = response.data;
      // If the backend returns an "enumeration-safe" success, we won't have tokens set.
      // Surface the generic message to the user so they can log in instead of being sent into /chat unauthenticated.
      if (!user.id) {
        throw new Error(response.message || 'Registration completed. Please sign in.');
      }

      set({ user, isAuthenticated: true });
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
    } else {
      throw new Error(response.error || 'Registration failed');
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, isAuthenticated: false });

      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    }
  },

  refreshToken: async () => {
    try {
      await api.post('/auth/refresh');
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  },

  checkSession: async () => {
    try {
      const response = await api.get<User>('/auth/me');
      if (response.success && response.data) {
        set({ user: response.data, isAuthenticated: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      } else {
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      }
    } catch {
      // Session invalid, try to restore from localStorage
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          // Try refresh
          try {
            await api.post('/auth/refresh');
            const response = await api.get<User>('/auth/me');
            if (response.success && response.data) {
              set({ user: response.data, isAuthenticated: true });
              return;
            }
          } catch {
            // Refresh also failed
          }
          localStorage.removeItem('user');
        }
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));

// Chat Store
export const useChatStore = create<ChatStore>()((set, get) => ({
  currentConversation: null,
  conversations: [],
  messages: [],
  isStreaming: false,
  sidebarOpen: true,

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
    if (conversation) {
      // Load messages for this conversation
      get().loadMessages(conversation.id);
    } else {
      set({ messages: [] });
    }
  },

  setConversations: (conversations) => set({ conversations }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content = content;
      }
      return { messages };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  loadConversations: async () => {
    const response = await api.get<Conversation[]>('/conversations');
    if (response.success && response.data) {
      set({ conversations: response.data });
    }
  },

  loadMessages: async (conversationId: string) => {
    const response = await api.get<Conversation>(`/conversations/${conversationId}`);
    if (response.success && response.data) {
      set({ messages: response.data.messages || [] });
    }
  },

  createConversation: async (title?: string) => {
    const response = await api.post<Conversation>('/conversations', { title });
    if (response.success && response.data) {
      set((state) => ({
        conversations: [response.data!, ...state.conversations],
        currentConversation: response.data,
        messages: [],
      }));
      return response.data;
    }
    throw new Error('Failed to create conversation');
  },

  deleteConversation: async (conversationId: string) => {
    await api.delete(`/conversations/${conversationId}`);
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
      currentConversation:
        state.currentConversation?.id === conversationId ? null : state.currentConversation,
    }));
  },

  sendMessage: async (content: string) => {
    const { currentConversation, messages, isStreaming } = get();

    if (isStreaming) {
      throw new Error('Already streaming a response');
    }

    if (!currentConversation) {
      throw new Error('No active conversation');
    }

    // Add user message
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: currentConversation.id,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
    }));

    try {
      // Stream the response
      await api.stream(
        '/messages/stream',
        {
          conversationId: currentConversation.id,
          content,
          model: currentConversation.model,
        },
        (chunk) => {
          // Add streaming message if not exists
          set((state) => {
            const newMessages = [...state.messages];
            const lastMessage = newMessages[newMessages.length - 1];

            if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id.startsWith('streaming-')) {
              // Update existing streaming message
              lastMessage.content += chunk;
            } else {
              // Create new streaming message
              newMessages.push({
                id: `streaming-${Date.now()}`,
                conversationId: currentConversation.id,
                role: 'assistant',
                content: chunk,
                createdAt: new Date().toISOString(),
              });
            }

            return { messages: newMessages };
          });
        },
        (error) => {
          console.error('Stream error:', error);
          set({ isStreaming: false });
        },
        () => {
          // Stream complete
          set({ isStreaming: false });
          // Reload messages to get the final message from server
          get().loadMessages(currentConversation.id);
        }
      );
    } catch (error) {
      console.error('Send message error:', error);
      set({ isStreaming: false });
      throw error;
    }
  },
}));
