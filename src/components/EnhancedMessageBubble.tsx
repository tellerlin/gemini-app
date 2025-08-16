import React, { useState } from 'react';
import { Copy, Check, User, Bot, Image, File } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Message } from '../types/chat';
import { cn } from '../utils/cn';
import { ModernMarkdownRenderer } from './ModernMarkdownRenderer';
import { RenderingErrorBoundary } from './RenderingErrorBoundary';

interface MessageBubbleProps {
  message: Message;
  isMobile?: boolean;
}

export function EnhancedMessageBubble({ message, isMobile = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('已复制消息到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('复制失败');
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUser = message.role === 'user';

  const renderContent = () => {
    if (isUser) {
      return (
        <div className="whitespace-pre-wrap text-white text-sm sm:text-base">
          {message.content}
        </div>
      );
    }

    // For AI responses, use modern markdown renderer
    return (
      <RenderingErrorBoundary>
        <ModernMarkdownRenderer 
          content={message.content}
          isMobile={isMobile}
          enableCopy={true}
          enableExport={true}
        />
      </RenderingErrorBoundary>
    );
  };

  return (
    <div className={cn(
      'flex w-full mb-4 sm:mb-6',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'flex space-x-2 sm:space-x-3',
        isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row',
        isMobile ? 'max-w-[95%]' : 'max-w-[90%]'
      )}>
        {/* Avatar */}
        <div className={cn(
          'flex-shrink-0 rounded-full flex items-center justify-center',
          isUser ? 'bg-blue-600' : 'bg-gray-600',
          isMobile ? 'w-7 h-7' : 'w-8 h-8'
        )}>
          {isUser ? (
            <User className={cn("text-white", isMobile ? "h-3 w-3" : "h-4 w-4")} />
          ) : (
            <Bot className={cn("text-white", isMobile ? "h-3 w-3" : "h-4 w-4")} />
          )}
        </div>

        {/* Message Content */}
        <div className={cn(
          'flex flex-col min-w-0',
          isUser ? 'items-end' : 'items-start'
        )}>
          <div className={cn(
            'rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm',
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200'
          )}>
            {/* Files */}
            {message.files && message.files.length > 0 && (
              <div className="mb-2 sm:mb-3 space-y-2">
                {message.files.map((file) => (
                  <div key={file.id} className="flex items-center space-x-2">
                    {file.type.startsWith('image/') ? (
                      <>
                        <Image className="h-3 w-3 sm:h-4 sm:w-4" />
                        <img
                          src={file.url}
                          alt={file.name}
                          className={cn(
                            "rounded-lg object-cover",
                            isMobile ? "max-w-32 max-h-32" : "max-w-48 max-h-48"
                          )}
                        />
                      </>
                    ) : (
                      <>
                        <File className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">{file.name}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Content */}
            {renderContent()}
          </div>

          {/* Message Actions */}
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
            {!isUser && (
              <button
                onClick={copyToClipboard}
                className={cn(
                  "p-1 text-gray-400 hover:text-gray-600 transition-colors",
                  "active:scale-95 touch-manipulation"
                )}
                title="复制整个消息"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 