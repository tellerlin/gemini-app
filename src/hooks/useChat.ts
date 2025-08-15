import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type { Message, Conversation, FileAttachment } from '../types/chat';
import { geminiService } from '../services/gemini';
import { useLocalStorage } from './useLocalStorage';

export function useChat() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('gemini-conversations', []);
  const [currentConversationId, setCurrentConversationId] = useLocalStorage<string | null>('current-conversation', null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeys, setApiKeys] = useLocalStorage<string[]>('gemini-api-keys', []);
  const [selectedModel, setSelectedModel] = useLocalStorage('selected-model', 'gemini-2.5-flash');

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

    // Update conversation with user message
    const updatedMessages = [...conversation.messages, userMessage];
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversation!.id
          ? {
              ...conv,
              messages: updatedMessages,
              title: conv.messages.length === 0 ? content.slice(0, 50) : conv.title,
              updatedAt: new Date(),
            }
          : conv
      )
    );

    setIsLoading(true);

    try {
      const response = await geminiService.generateResponse(updatedMessages, selectedModel);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversation!.id
            ? {
                ...conv,
                messages: [...updatedMessages, assistantMessage],
                updatedAt: new Date(),
              }
            : conv
        )
      );
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
  };
}