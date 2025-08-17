import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { 
  Message, 
  Conversation, 
  FileAttachment, 
  ConversationConfig
} from '../types/chat';
import { geminiService } from '../services/gemini';
import type { GeminiResponse } from '../services/gemini';
import { useLocalStorage, useConversations } from './useLocalStorage';
import { loadApiKeysFromEnv } from '../utils/env';
import { ContextManager, type ContextConfig } from '../utils/contextManager';
import { getOptimalThinkingConfig, getModelCapabilities } from '../config/gemini';

export function useChat() {
  // Use new IndexedDB storage system
  const {
    conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    saveConversation,
    deleteConversation: dbDeleteConversation,
    cleanupOldConversations,
    getStorageUsage,
  } = useConversations();
  
  const [currentConversationId, setCurrentConversationId] = useLocalStorage<string | null>('current-conversation', null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [apiKeys, setApiKeys] = useLocalStorage<string[]>('gemini-api-keys', []);
  const [selectedModel, setSelectedModel] = useLocalStorage('selected-model', 'gemini-2.5-flash');
  
  // Enhanced default configurations with grounding and URL context
  const [defaultConversationConfig, setDefaultConversationConfig] = useLocalStorage<ConversationConfig>('default-conversation-config', {
    thinkingConfig: {
      enabled: true,
      budget: 15000, // Will be auto-adjusted based on content
      showThinkingProcess: false,
    },
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1000000,
    },
    groundingConfig: {
      enabled: false, // User can enable when needed
      useGoogleSearch: true,
      maxResults: 5,
    },
    urlContextConfig: {
      enabled: false, // User can enable when needed
      maxUrls: 3,
    },
    // Interface settings with sensible defaults
    streamingEnabled: true,
    typewriterEffect: true,
    smartLoadingIndicators: true,
    realtimeFeedback: true,
  });

  // Enhanced context management configuration
  const [contextConfig, setContextConfig] = useLocalStorage<ContextConfig>('context-config', {
    maxHistoryLength: 20,
    maxTokens: 100000, // Increased for enhanced context management
    prioritizeRecent: true,
    preserveSystemMessages: true,
    summaryEnabled: true,
    intelligentSummarization: true,
    adaptiveTokenManagement: true,
    preserveFileAttachments: true,
  });

  // Create context manager instance
  const contextManager = useMemo(() => new ContextManager(contextConfig), [contextConfig]);

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
  }, [apiKeys, setApiKeys]); // Only run once on mount

  const currentConversation = conversations.find(conv => conv.id === currentConversationId);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: selectedModel,
      config: defaultConversationConfig,
    };

    // 使用新的保存方法
    saveConversation(newConversation);
    setCurrentConversationId(newConversation.id);
    return newConversation;
  }, [selectedModel, defaultConversationConfig, saveConversation, setCurrentConversationId]);

  const sendMessage = useCallback(async (content: string, files?: FileAttachment[]) => {
    if (!apiKeys || apiKeys.length === 0) {
      toast.error('Please set your Gemini API keys first');
      return;
    }

    geminiService.setApiKeys(apiKeys);

    // Ensure we have a current conversation
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

    // Update conversation, add user message
    const updatedMessages = [...conversation.messages, userMessage];
    
    // Get model capabilities and optimize configuration
    const modelCapabilities = getModelCapabilities(selectedModel);
    
    // Auto-adjust thinking configuration based on content
    const optimalThinking = getOptimalThinkingConfig(content, selectedModel);
    
    // Enhanced conversation config with intelligent defaults
    const enhancedConfig = {
      ...conversation.config,
      thinkingConfig: {
        ...conversation.config?.thinkingConfig,
        ...optimalThinking,
      },
      // Enable grounding for information-seeking queries
      groundingConfig: {
        ...conversation.config?.groundingConfig,
        enabled: conversation.config?.groundingConfig?.enabled || 
          (content.toLowerCase().includes('latest') || 
           content.toLowerCase().includes('recent') || 
           content.toLowerCase().includes('current') ||
           content.toLowerCase().includes('news') ||
           content.toLowerCase().includes('today') ||
           content.toLowerCase().includes('2024') ||
           content.toLowerCase().includes('2025')),
      }
    };

    const updatedConversation = {
      ...conversation,
      messages: updatedMessages,
      title: conversation.messages.length === 0 ? content.slice(0, 50) : conversation.title,
      updatedAt: new Date(),
      config: enhancedConfig,
    };

    // First save user message to IndexedDB
    await saveConversation(updatedConversation);

    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      const assistantMessageId = (Date.now() + 1).toString();
      let fullResponse = '';
      let groundingMetadata = null;
      let urlContextMetadata = null;
      
      // Create placeholder assistant message
      const placeholderMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      // Add placeholder message immediately for streaming display
      const tempMessages = [...updatedMessages, placeholderMessage];
      const tempConversation = {
        ...updatedConversation,
        messages: tempMessages,
        updatedAt: new Date(),
      };

      // Save temporary conversation with placeholder
      await saveConversation(tempConversation);

      // Use enhanced streaming response with grounding support
      let optimizedMessages = updatedMessages;
      
      // Apply enhanced context optimization with model awareness
      if (contextManager.needsOptimization(updatedMessages)) {
        console.log('🧠 Applying enhanced context optimization...');
        optimizedMessages = contextManager.optimizeContext(updatedMessages, selectedModel);
        
        const summary = contextManager.createIntelligentSummary(
          updatedMessages.slice(0, updatedMessages.length - optimizedMessages.length)
        );
        
        if (summary) {
          console.log('📋 Enhanced context summary created:', summary.content.substring(0, 100) + '...');
        }
      }

      // Use grounding-enabled streaming if available and enabled
      const useGrounding = enhancedConfig.groundingConfig?.enabled && modelCapabilities.supportsGrounding;
      
      // Disable streaming for some models as they don't support it
      const useStreaming = enhancedConfig.streamingEnabled !== false;
      
      if (useStreaming) {
        setIsStreaming(true);
        if (useGrounding) {
          console.log('🔍 Using grounding-enabled streaming generation');
          const stream = geminiService.generateStreamingResponseWithGrounding(
            optimizedMessages, 
            selectedModel,
            enhancedConfig
          );

          for await (const chunk of stream) {
            if (chunk.text) {
              fullResponse += chunk.text;
              setStreamingMessage(fullResponse);
              // Don't update conversations during streaming - only update streamingMessage
            }
            
            // Capture grounding metadata
            if (chunk.groundingMetadata) {
              groundingMetadata = chunk.groundingMetadata;
            }
            
            if (chunk.urlContextMetadata) {
              urlContextMetadata = chunk.urlContextMetadata;
            }
          }
        } else {
          // Use standard streaming
          console.log('⚡ Using standard streaming generation');
          const stream = geminiService.generateStreamingResponse(
            optimizedMessages, 
            selectedModel,
            enhancedConfig
          );

          for await (const chunk of stream) {
            fullResponse += chunk;
            setStreamingMessage(fullResponse);
            // Don't update conversations during streaming - only update streamingMessage
          }
        }
      } else {
        // Non-streaming mode - get complete response at once
        console.log('🎯 Using non-streaming generation');
        if (useGrounding) {
          const response = await geminiService.generateResponseWithGrounding(
            optimizedMessages,
            selectedModel,
            enhancedConfig
          );
          fullResponse = response.text;
          groundingMetadata = response.groundingMetadata;
          urlContextMetadata = response.urlContextMetadata;
        } else {
          const response = await geminiService.generateResponse(
            optimizedMessages,
            selectedModel,
            enhancedConfig
          );
          
          // Handle both string and GeminiResponse types
          if (typeof response === 'string') {
            fullResponse = response;
          } else {
            fullResponse = response.text || '';
            // Handle images if present
            if (response.images && response.images.length > 0) {
              const generatedImages: FileAttachment[] = [];
              response.images.forEach((imageData, index) => {
                const imageFile: FileAttachment = {
                  id: `generated-${Date.now()}-${index}`,
                  name: `generated_image_${index + 1}.png`,
                  type: 'image/png',
                  size: Math.round(imageData.length * 0.75),
                  url: `data:image/png;base64,${imageData}`,
                  data: `data:image/png;base64,${imageData}`,
                };
                generatedImages.push(imageFile);
              });
              
              // Update the final message to include images
              const imageMessage: Message = {
                id: assistantMessageId,
                role: 'assistant',
                content: fullResponse || `Generated ${response.images.length} image${response.images.length > 1 ? 's' : ''} using ${selectedModel}`,
                timestamp: new Date(),
                files: generatedImages,
                metadata: {
                  modelUsed: selectedModel,
                  thinkingEnabled: optimalThinking.enabled,
                  ...(response.groundingMetadata && { groundingMetadata: response.groundingMetadata }),
                  ...(response.urlContextMetadata && { urlContextMetadata: response.urlContextMetadata }),
                },
              };
              
              const finalMessagesWithImages = [...updatedMessages, imageMessage];
              const finalConversationWithImages = {
                ...updatedConversation,
                messages: finalMessagesWithImages,
                updatedAt: new Date(),
              };
              
              await saveConversation(finalConversationWithImages);
              setConversations(prev => ({
                ...prev,
                [conversationId]: finalConversationWithImages,
              }));
              
              return;
            }
            
            groundingMetadata = response.groundingMetadata;
            urlContextMetadata = response.urlContextMetadata;
          }
        }
        
        // No need to update conversations here - it will be done in the final update below
      }

      // Final update with complete message and metadata
      const finalMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        metadata: {
          modelUsed: selectedModel,
          thinkingEnabled: optimalThinking.enabled,
          ...(groundingMetadata && { groundingMetadata }),
          ...(urlContextMetadata && { urlContextMetadata }),
        },
      };

      const finalMessages = [...updatedMessages, finalMessage];
      const finalConversation = {
        ...updatedConversation,
        messages: finalMessages,
        updatedAt: new Date(),
      };

      console.log('✅ Final update with complete message');
      // Save final complete conversation to IndexedDB
      await saveConversation(finalConversation);

      // Show grounding info if available
      if (groundingMetadata?.webSearchQueries?.length > 0) {
        toast.success(`🔍 Found information from ${groundingMetadata.groundingChunks?.length || 0} sources`);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to generate response. Please try again.');
      
      // Remove placeholder message on error - resave conversation without empty messages
      try {
        const errorConversation = {
          ...conversation,
          messages: conversation.messages.filter(msg => msg.content !== ''),
          updatedAt: new Date(),
        };
        await saveConversation(errorConversation);
      } catch (saveErr) {
        console.error('Failed to save conversation after error:', saveErr);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  }, [apiKeys, currentConversation, createNewConversation, selectedModel, saveConversation, contextManager]);


  const deleteConversation = useCallback((conversationId: string) => {
    dbDeleteConversation(conversationId);
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
  }, [dbDeleteConversation, currentConversationId, setCurrentConversationId]);

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

  const updateConversationConfig = useCallback(async (conversationId: string, config: ConversationConfig) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      const updatedConversation = {
        ...conversation,
        config,
        updatedAt: new Date()
      };
      await saveConversation(updatedConversation);
    }
  }, [conversations, saveConversation]);

  const stopGeneration = useCallback(() => {
    geminiService.stopGeneration();
    setIsStreaming(false);
    setIsLoading(false);
    toast.info('Generation stopped');
  }, []);

  const updateContextConfig = useCallback((newConfig: Partial<ContextConfig>) => {
    const updatedConfig = { ...contextConfig, ...newConfig };
    setContextConfig(updatedConfig);
    contextManager.updateConfig(newConfig);
    toast.success('Context management settings updated');
  }, [contextConfig, contextManager, setContextConfig]);

  const getContextInfo = useCallback(() => {
    if (!currentConversation) {
      return null;
    }
    
    const messages = currentConversation.messages;
    const estimatedTokens = contextManager.estimateTokens(messages);
    const needsOptimization = contextManager.needsOptimization(messages);
    
    return {
      messageCount: messages.length,
      estimatedTokens,
      needsOptimization,
      maxHistoryLength: contextConfig.maxHistoryLength,
      maxTokens: contextConfig.maxTokens,
    };
  }, [currentConversation, contextManager, contextConfig]);

  const getPerformanceMetrics = useCallback(() => {
    return geminiService.getStats();
  }, []);

  return {
    conversations,
    currentConversation,
    isLoading: isLoading || conversationsLoading,
    isStreaming,
    streamingMessage,
    apiKeys,
    setApiKeys,
    selectedModel,
    setSelectedModel,
    sendMessage,
    stopGeneration,
    createNewConversation,
    deleteConversation,
    selectConversation,
    exportConversation,
    // New configuration functions
    defaultConversationConfig,
    setDefaultConversationConfig,
    updateConversationConfig,
    getPerformanceMetrics,
    // Context management
    contextConfig,
    updateContextConfig,
    getContextInfo,
    // Data management
    cleanupOldConversations,
    getStorageUsage,
    // Error state
    error: conversationsError,
  };
}