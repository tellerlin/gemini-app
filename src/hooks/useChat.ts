import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { Message, Conversation, FileAttachment } from '../types/chat';
import { geminiService } from '../services/gemini';
import { useLocalStorage } from './useLocalStorage';
import { loadApiKeysFromEnv } from '../utils/env';

export function useChat() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('gemini-conversations', []);
  const [currentConversationId, setCurrentConversationId] = useLocalStorage<string | null>('current-conversation', null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeys, setApiKeys] = useLocalStorage<string[]>('gemini-api-keys', []);
  const [selectedModel, setSelectedModel] = useLocalStorage('selected-model', 'gemini-2.5-flash');

  // Load API keys from environment variables on initialization
  useEffect(() => {
    const envApiKeys = loadApiKeysFromEnv();
    if (envApiKeys.length > 0) {
      // Merge environment keys with stored keys, avoiding duplicates
      const allKeys = [...new Set([...envApiKeys, ...apiKeys])];
      if (allKeys.length !== apiKeys.length) {
        setApiKeys(allKeys);
        toast.success(`Loaded ${envApiKeys.length} API key(s) from environment variables`);
      }
    }
  }, []); // Only run once on mount

  const currentConversation = conversations.find(conv => conv.id === currentConversationId);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: selectedModel,
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    return newConversation;
  }, [selectedModel, setConversations, setCurrentConversationId]);

  const sendMessage = useCallback(async (content: string, files?: FileAttachment[]) => {
    if (!apiKeys || apiKeys.length === 0) {
      toast.error('Please set your Gemini API keys first');
      return;
    }

    geminiService.setApiKeys(apiKeys);

    // 确保我们有当前对话
    let conversation = currentConversation;
    if (!conversation) {
      conversation = createNewConversation();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      files,
    };

    // 更新对话，添加用户消息
    const updatedMessages = [...conversation.messages, userMessage];
    const updatedConversation = {
      ...conversation,
      messages: updatedMessages,
      title: conversation.messages.length === 0 ? content.slice(0, 50) : conversation.title,
      updatedAt: new Date(),
    };

    setConversations(prev => {
      const existingIndex = prev.findIndex(conv => conv.id === conversation.id);
      if (existingIndex >= 0) {
        // 更新现有对话
        const newConversations = [...prev];
        newConversations[existingIndex] = updatedConversation;
        return newConversations;
      } else {
        // 添加新对话
        return [updatedConversation, ...prev];
      }
    });

    setIsLoading(true);

    try {
      const response = await geminiService.generateResponse(updatedMessages, selectedModel);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      // 更新对话，添加助手消息
      const finalMessages = [...updatedMessages, assistantMessage];
      const finalConversation = {
        ...updatedConversation,
        messages: finalMessages,
        updatedAt: new Date(),
      };

      setConversations(prev => {
        const existingIndex = prev.findIndex(conv => conv.id === conversation.id);
        if (existingIndex >= 0) {
          const newConversations = [...prev];
          newConversations[existingIndex] = finalConversation;
          return newConversations;
        } else {
          return [finalConversation, ...prev];
        }
      });
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to generate response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [apiKeys, currentConversation, createNewConversation, selectedModel, setConversations]);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
  }, [setConversations, currentConversationId, setCurrentConversationId]);

  const selectConversation = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
  }, [setCurrentConversationId]);

  const exportConversation = useCallback((conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) {
      toast.error('Conversation not found');
      return;
    }

    // Create formatted export content
    const exportContent = conversation.messages.map(message => {
      const timestamp = new Date(message.timestamp).toLocaleString();
      const role = message.role === 'user' ? 'User' : 'Assistant';
      return `[${timestamp}] ${role}:\n${message.content}\n`;
    }).join('\n---\n\n');

    const fullContent = `Conversation: ${conversation.title}\nCreated: ${new Date(conversation.createdAt).toLocaleString()}\nUpdated: ${new Date(conversation.updatedAt).toLocaleString()}\nModel: ${conversation.model}\n\n${exportContent}`;

    // Create and download file
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Conversation exported successfully');
  }, [conversations]);

  return {
    conversations,
    currentConversation,
    isLoading,
    apiKeys,
    setApiKeys,
    selectedModel,
    setSelectedModel,
    sendMessage,
    createNewConversation,
    deleteConversation,
    selectConversation,
    exportConversation,
  };
}