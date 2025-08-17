import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { 
  Message, 
  Conversation, 
  FileAttachment, 
  ConversationConfig, 
  ImageGenerationConfig
} from '../types/chat';
import { geminiService } from '../services/gemini';
import { useLocalStorage, useConversations } from './useLocalStorage';
import { loadApiKeysFromEnv } from '../utils/env';
import { ContextManager, type ContextConfig } from '../utils/contextManager';
import { getOptimalThinkingConfig, getModelCapabilities } from '../config/gemini';

export function useChat() {
  // 使用新的IndexedDB存储系统
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
  
  const [defaultImageConfig, setDefaultImageConfig] = useLocalStorage<ImageGenerationConfig>('default-image-config', {
    numberOfImages: 1,
    sampleImageSize: '1K',
    aspectRatio: '1:1',
    personGeneration: 'allow_adult',
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

    // 先保存用户消息到IndexedDB
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

      // 保存带占位符的临时对话
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
      const useStreaming = enhancedConfig.streamingEnabled !== false; // Default to true if not specified
      
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
          fullResponse = await geminiService.generateResponse(
            optimizedMessages,
            selectedModel
          );
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
      // 保存最终完整的对话到IndexedDB
      await saveConversation(finalConversation);

      // Show grounding info if available
      if (groundingMetadata?.webSearchQueries?.length > 0) {
        toast.success(`🔍 Found information from ${groundingMetadata.groundingChunks?.length || 0} sources`);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to generate response. Please try again.');
      
      // Remove placeholder message on error - 重新保存不包含空消息的对话
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

  const generateImage = useCallback(async (
    content: string, 
    files?: FileAttachment[], 
    imageRequirements?: {
      quality?: 'fast' | 'standard' | 'ultra';
      artistic?: boolean;
      conversational?: boolean;
      speed?: 'fast' | 'normal';
    }
  ) => {
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

    // 先保存用户消息到IndexedDB
    await saveConversation(updatedConversation);

    setIsLoading(true);

    try {
      let response;
      
      // Determine if user wants conversational or dedicated image generation
      const useConversationalGeneration = imageRequirements?.conversational || 
        (files && files.length > 0); // Use conversational for image editing
      
      if (useConversationalGeneration) {
        console.log('🎨 Using conversational image generation');
        response = await geminiService.generateImageContent(
          updatedMessages, 
          'gemini-2.0-flash-preview-image-generation'
        );
      } else {
        console.log('🎨 Using intelligent image model selection');
        // Use intelligent selection with enhanced requirements
        const enhancedRequirements = {
          ...defaultImageConfig,
          ...imageRequirements,
        };
        
        response = await geminiService.generateImageWithIntelligentSelection(
          updatedMessages,
          enhancedRequirements
        );
      }

      // Create assistant message with text and images
      let responseContent = response.text || '';
      const generatedImages: FileAttachment[] = [];
      
      if (response.images && response.images.length > 0) {
        // Convert generated images to FileAttachment format
        response.images.forEach((imageData, index) => {
          const imageFile: FileAttachment = {
            id: `generated-${Date.now()}-${index}`,
            name: `generated_image_${index + 1}.png`,
            type: 'image/png',
            size: Math.round(imageData.length * 0.75), // Estimate size from base64
            url: `data:image/png;base64,${imageData}`,
            data: `data:image/png;base64,${imageData}`,
          };
          generatedImages.push(imageFile);
        });
        
        if (!responseContent) {
          const modelType = useConversationalGeneration ? 'Gemini conversational' : 'intelligent selection';
          responseContent = `Generated ${response.images.length} image${response.images.length > 1 ? 's' : ''} using ${modelType}`;
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        files: generatedImages.length > 0 ? generatedImages : undefined,
        metadata: {
          modelUsed: useConversationalGeneration ? 'gemini-2.0-flash-preview-image-generation' : 'intelligent-selection',
        },
      };

      // 更新对话，添加助手消息 - 先保存用户消息再保存完整对话
      await saveConversation(updatedConversation);
      
      const finalMessages = [...updatedMessages, assistantMessage];
      const finalConversation = {
        ...updatedConversation,
        messages: finalMessages,
        updatedAt: new Date(),
      };

      // 保存完整对话到IndexedDB
      await saveConversation(finalConversation);

      toast.success(`✨ Generated ${generatedImages.length} image${generatedImages.length > 1 ? 's' : ''} successfully!`);
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [apiKeys, currentConversation, createNewConversation, defaultImageConfig, saveConversation]);

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
    generateImage,
    stopGeneration,
    createNewConversation,
    deleteConversation,
    selectConversation,
    exportConversation,
    // New configuration functions
    defaultConversationConfig,
    setDefaultConversationConfig,
    defaultImageConfig,
    setDefaultImageConfig,
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