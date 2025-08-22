import React, { useRef, useEffect, useMemo, memo, useCallback } from 'react';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { ChatInput } from './ChatInput';
import { SmartLoadingIndicator } from './SmartLoadingIndicator';
import type { Message, FileAttachment, ConversationConfig } from '../types/chat';
import { Bot, Sparkles } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string, files?: FileAttachment[]) => void;
  onGenerateImage?: (content: string, files?: FileAttachment[]) => void;
  onStopGeneration?: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessage?: string;
  hasApiKey: boolean;
  isMobile?: boolean;
  conversationConfig?: ConversationConfig;
}

export const ChatArea = memo(function ChatArea({ 
  messages, 
  onSendMessage, 
  onGenerateImage, 
  onStopGeneration,
  isLoading, 
  isStreaming,
  streamingMessage,
  hasApiKey, 
  isMobile = false,
  conversationConfig
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoized scroll function with debouncing for better performance
  const scrollToBottom = useCallback(() => {
    const element = messagesEndRef.current;
    if (element) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, streamingMessage, scrollToBottom]);

  // Memoize messages list to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => messages, [messages]);

  // Memoize last message check for streaming
  const lastMessageId = useMemo(() => {
    return messages.length > 0 ? messages[messages.length - 1]?.id : null;
  }, [messages]);

  // Memoized streaming check
  const isMessageStreaming = useCallback((messageId: string, role: string) => {
    return isStreaming && messageId === lastMessageId && role === 'assistant';
  }, [isStreaming, lastMessageId]);

  if (!hasApiKey) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center mobile-p-safe">
          <div className="text-center max-w-md mx-auto card-modern">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-modern">
              <Bot className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-fluid-lg font-semibold gradient-text mb-4">
              Welcome to Gemini Chat
            </h2>
            <p className="text-fluid-sm text-gray-600 mb-6 leading-relaxed">
              To get started, please configure your Gemini API key using the settings in the sidebar.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 backdrop-blur-sm">
              <p className="mobile-text-enhanced font-medium text-gray-700 mb-3">✨ Features available:</p>
              <ul className="mobile-text-sm-enhanced text-gray-600 space-y-2 text-left">
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Real-time AI conversations</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>Image and document uploads</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>Conversation history</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>Multiple Gemini models</li>
              </ul>
            </div>
          </div>
        </div>
        <ChatInput
          onSendMessage={onSendMessage}
          onGenerateImage={onGenerateImage}
          isLoading={isLoading}
          disabled={true}
          isMobile={isMobile}
        />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center mobile-p-safe">
          <div className="text-center max-w-lg mx-auto card-modern">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-modern animate-pulse">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-fluid-lg font-semibold gradient-text mb-4">
              Start a new conversation
            </h2>
            <p className="text-fluid-sm text-gray-600 mb-6 leading-relaxed">
              Ask me anything! I can help with questions, analysis, creative tasks, and more.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-5 text-left backdrop-blur-sm border border-white/40">
                <p className="font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    💡
                  </span>
                  Example prompts:
                </p>
                <ul className="mobile-text-sm-enhanced text-gray-600 space-y-3">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    "Explain quantum computing in simple terms"
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    "Write a Python function to sort data"
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    "Analyze this image" <span className="text-xs bg-purple-100 px-2 py-1 rounded-full ml-1">with upload</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    "Generate an image of a sunset" <span className="text-xs bg-pink-100 px-2 py-1 rounded-full ml-1">image generation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <ChatInput
          onSendMessage={onSendMessage}
          onGenerateImage={onGenerateImage}
          isLoading={isLoading}
          isMobile={isMobile}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area with enhanced styling */}
      <div className="flex-1 overflow-y-auto mobile-p-safe space-y-4 bg-gradient-to-b from-transparent via-white/10 to-white/20">
        {memoizedMessages.map((message) => (
          <EnhancedMessageBubble 
            key={message.id} 
            message={message} 
            isMobile={isMobile}
            isStreaming={isMessageStreaming(message.id, message.role)}
            conversationConfig={conversationConfig}
            onStopGeneration={onStopGeneration}
            streamingContent={isMessageStreaming(message.id, message.role) ? streamingMessage : undefined}
          />
        ))}
        
        {/* Loading Indicator - only show when not streaming */}
        {isLoading && !isStreaming && (
          <SmartLoadingIndicator
            isLoading={isLoading}
            isStreaming={isStreaming}
            messageContent={messages[messages.length - 1]?.content || ''}
            requestType="text"
            enableSmartIndicators={conversationConfig?.smartLoadingIndicators}
            enableRealtimeFeedback={conversationConfig?.realtimeFeedback}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        onGenerateImage={onGenerateImage}
        isLoading={isLoading}
        isMobile={isMobile}
      />
    </div>
  );
});