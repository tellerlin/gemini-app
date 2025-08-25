import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import type { Conversation, Message, ConversationConfig } from '../types/chat';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  apiKeyModalOpen: boolean;
  advancedSettingsOpen: boolean;
  performanceMonitorOpen: boolean;
  
  // Chat State
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessage: string;
  
  // Configuration
  apiKeys: string[];
  selectedModel: string;
  defaultConversationConfig: ConversationConfig;
  
  // Performance
  lastActivity: number;
  
  // Actions
  actions: {
    // UI Actions
    setSidebarOpen: (open: boolean) => void;
    setApiKeyModalOpen: (open: boolean) => void;
    setAdvancedSettingsOpen: (open: boolean) => void;
    setPerformanceMonitorOpen: (open: boolean) => void;
    
    // Chat Actions
    setConversations: (conversations: Conversation[]) => void;
    addConversation: (conversation: Conversation) => void;
    updateConversation: (id: string, updates: Partial<Conversation>) => void;
    removeConversation: (id: string) => void;
    setCurrentConversationId: (id: string | null) => void;
    
    // Messages
    addMessage: (conversationId: string, message: Message) => void;
    updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
    
    // Loading States
    setIsLoading: (loading: boolean) => void;
    setIsStreaming: (streaming: boolean) => void;
    setStreamingMessage: (message: string) => void;
    
    // Configuration
    setApiKeys: (keys: string[]) => void;
    setSelectedModel: (model: string) => void;
    setDefaultConversationConfig: (config: ConversationConfig) => void;
    
    // Performance
    updateActivity: () => void;
    
    // Batch Actions for Performance
    batchUpdate: (updates: (state: AppState) => void) => void;
  };
}

// Default configuration
const defaultConfig: ConversationConfig = {
  thinkingConfig: {
    enabled: true,
    budget: 15000,
    showThinkingProcess: false,
  },
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1000000,
  },
  groundingConfig: {
    enabled: true,
    useGoogleSearch: true,
    maxResults: 5,
  },
  urlContextConfig: {
    enabled: false,
    maxUrls: 3,
  },
  streamingEnabled: true,
  typewriterEffect: true,
  smartLoadingIndicators: true,
  realtimeFeedback: true,
};

export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    immer(
      persist(
        (set, get) => ({
          // Initial State
          sidebarOpen: false,
          apiKeyModalOpen: false,
          advancedSettingsOpen: false,
          performanceMonitorOpen: false,
          
          conversations: [],
          currentConversationId: null,
          isLoading: false,
          isStreaming: false,
          streamingMessage: '',
          
          apiKeys: [],
          selectedModel: 'gemini-2.0-flash',
          defaultConversationConfig: defaultConfig,
          
          lastActivity: Date.now(),
          
          actions: {
            // UI Actions
            setSidebarOpen: (open) => set((state) => {
              state.sidebarOpen = open;
            }),
            
            setApiKeyModalOpen: (open) => set((state) => {
              state.apiKeyModalOpen = open;
            }),
            
            setAdvancedSettingsOpen: (open) => set((state) => {
              state.advancedSettingsOpen = open;
            }),
            
            setPerformanceMonitorOpen: (open) => set((state) => {
              state.performanceMonitorOpen = open;
            }),
            
            // Chat Actions
            setConversations: (conversations) => set((state) => {
              state.conversations = conversations;
            }),
            
            addConversation: (conversation) => set((state) => {
              state.conversations.unshift(conversation);
            }),
            
            updateConversation: (id, updates) => set((state) => {
              const index = state.conversations.findIndex(c => c.id === id);
              if (index !== -1) {
                Object.assign(state.conversations[index], updates);
              }
            }),
            
            removeConversation: (id) => set((state) => {
              state.conversations = state.conversations.filter(c => c.id !== id);
              if (state.currentConversationId === id) {
                state.currentConversationId = null;
              }
            }),
            
            setCurrentConversationId: (id) => set((state) => {
              state.currentConversationId = id;
            }),
            
            // Messages
            addMessage: (conversationId, message) => set((state) => {
              const conversation = state.conversations.find(c => c.id === conversationId);
              if (conversation) {
                conversation.messages.push(message);
                conversation.updatedAt = new Date();
              }
            }),
            
            updateMessage: (conversationId, messageId, updates) => set((state) => {
              const conversation = state.conversations.find(c => c.id === conversationId);
              if (conversation) {
                const message = conversation.messages.find(m => m.id === messageId);
                if (message) {
                  Object.assign(message, updates);
                  conversation.updatedAt = new Date();
                }
              }
            }),
            
            // Loading States
            setIsLoading: (loading) => set((state) => {
              state.isLoading = loading;
              if (loading) state.lastActivity = Date.now();
            }),
            
            setIsStreaming: (streaming) => set((state) => {
              state.isStreaming = streaming;
              if (streaming) state.lastActivity = Date.now();
            }),
            
            setStreamingMessage: (message) => set((state) => {
              state.streamingMessage = message;
              state.lastActivity = Date.now();
            }),
            
            // Configuration
            setApiKeys: (keys) => set((state) => {
              state.apiKeys = keys;
            }),
            
            setSelectedModel: (model) => set((state) => {
              state.selectedModel = model;
            }),
            
            setDefaultConversationConfig: (config) => set((state) => {
              state.defaultConversationConfig = config;
            }),
            
            // Performance
            updateActivity: () => set((state) => {
              state.lastActivity = Date.now();
            }),
            
            // Batch Updates
            batchUpdate: (updates) => set((state) => {
              updates(state);
              state.lastActivity = Date.now();
            })
          }
        }),
        {
          name: 'gemini-app-store',
          // Only persist essential data
          partialize: (state) => ({
            apiKeys: state.apiKeys,
            selectedModel: state.selectedModel,
            defaultConversationConfig: state.defaultConversationConfig,
            currentConversationId: state.currentConversationId,
          }),
          version: 1,
        }
      )
    )
  )
);

// Selectors for optimized component subscriptions
export const useUIState = () => useAppStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  apiKeyModalOpen: state.apiKeyModalOpen,
  advancedSettingsOpen: state.advancedSettingsOpen,
  performanceMonitorOpen: state.performanceMonitorOpen
}));

export const useChatState = () => useAppStore((state) => ({
  conversations: state.conversations,
  currentConversationId: state.currentConversationId,
  isLoading: state.isLoading,
  isStreaming: state.isStreaming,
  streamingMessage: state.streamingMessage
}));

export const useConfigState = () => useAppStore((state) => ({
  apiKeys: state.apiKeys,
  selectedModel: state.selectedModel,
  defaultConversationConfig: state.defaultConversationConfig
}));

export const useUIActions = () => useAppStore((state) => ({
  setSidebarOpen: state.actions.setSidebarOpen,
  setApiKeyModalOpen: state.actions.setApiKeyModalOpen,
  setAdvancedSettingsOpen: state.actions.setAdvancedSettingsOpen,
  setPerformanceMonitorOpen: state.actions.setPerformanceMonitorOpen
}));

export const useChatActions = () => useAppStore((state) => ({
  setConversations: state.actions.setConversations,
  addConversation: state.actions.addConversation,
  updateConversation: state.actions.updateConversation,
  removeConversation: state.actions.removeConversation,
  setCurrentConversationId: state.actions.setCurrentConversationId,
  addMessage: state.actions.addMessage,
  updateMessage: state.actions.updateMessage,
  setIsLoading: state.actions.setIsLoading,
  setIsStreaming: state.actions.setIsStreaming,
  setStreamingMessage: state.actions.setStreamingMessage
}));

export const useConfigActions = () => useAppStore((state) => ({
  setApiKeys: state.actions.setApiKeys,
  setSelectedModel: state.actions.setSelectedModel,
  setDefaultConversationConfig: state.actions.setDefaultConversationConfig
}));

// Performance monitoring
export const usePerformanceMetrics = () => useAppStore((state) => ({
  lastActivity: state.lastActivity,
  conversationsCount: state.conversations.length,
  messagesCount: state.conversations.reduce((sum, conv) => sum + conv.messages.length, 0)
}));