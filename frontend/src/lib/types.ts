// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  openRouterApiKey?: string;
  preferredModel: string;
  theme: 'light' | 'dark';
  createdAt: string;
  updatedAt: string;
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  userId: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
}

// Chat types
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  model?: string;
}

export interface StreamMessageEvent {
  type: 'token' | 'done' | 'error';
  content?: string;
  error?: string;
}

// Model types
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  pricing?: {
    prompt: number;
    completion: number;
  };
}

export interface PublicConfig {
  maxContextMessages: number;
  allowUserApiKeys: boolean;
  requireUserApiKey: boolean;
  defaultModelId: string;
  models: Array<{
    id: string;
    name: string;
    provider: string;
    description?: string | null;
  }>;
}

// Store types
export interface ChatStore {
  currentConversation: Conversation | null;
  conversations: Conversation[];
  messages: Message[];
  isStreaming: boolean;
  sidebarOpen: boolean;

  setCurrentConversation: (conversation: Conversation | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation>;
  deleteConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkSession: () => Promise<void>;
}
