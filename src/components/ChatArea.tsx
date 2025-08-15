import React, { useRef, useEffect } from 'react';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { ChatInput } from './ChatInput';
import type { Message, FileAttachment } from '../types/chat';
import { Bot, Sparkles } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string, files?: FileAttachment[]) => void;
  isLoading: boolean;
  hasApiKey: boolean;
  isMobile?: boolean;
}

export function ChatArea({ messages, onSendMessage, isLoading, hasApiKey, isMobile = false }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!hasApiKey) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto p-4 sm:p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Welcome to Gemini Chat
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              To get started, please configure your Gemini API key using the settings in the sidebar.
            </p>
            <div className="text-xs sm:text-sm text-gray-500">
              <p>Features available:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Real-time AI conversations</li>
                <li>Image and document uploads</li>
                <li>Conversation history</li>
                <li>Multiple Gemini models</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto p-4 sm:p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Start a new conversation
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Ask me anything! I can help with questions, analysis, creative tasks, and more.
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
              <div className="p-3 bg-gray-50 rounded-lg text-left">
                <p className="font-medium text-gray-700">💡 Example prompts:</p>
                <ul className="mt-1 text-gray-600 space-y-1">
                  <li>• "Explain quantum computing"</li>
                  <li>• "Write a Python function to..."</li>
                  <li>• "Analyze this image" (with upload)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <ChatInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          isMobile={isMobile}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message) => (
          <EnhancedMessageBubble key={message.id} message={message} isMobile={isMobile} />
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-3 sm:px-4 py-3">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        isMobile={isMobile}
      />
    </div>
  );
}