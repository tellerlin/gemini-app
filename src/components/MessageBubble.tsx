import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, User, Bot, Image, File } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Message } from '../types/chat';
import { cn } from '../utils/cn';

interface MessageBubbleProps {
  message: Message;
  isMobile?: boolean;
}

// 代码块复制组件
function CodeBlockCopy({ code, language, isMobile = false }: { code: string; language: string; isMobile?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Copied ${language} code to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={copyToClipboard}
        className={cn(
          "absolute top-2 right-2 p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-all z-10",
          "active:scale-95 touch-manipulation",
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        title={`Copy ${language} code`}
      >
        {copied ? (
          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
        ) : (
          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
        )}
      </button>
    </div>
  );
}

export function MessageBubble({ message, isMobile = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Copied message to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUser = message.role === 'user';

  return (
    <div className={cn(
      'flex w-full mb-4 sm:mb-6',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'flex space-x-2 sm:space-x-3',
        isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row',
        isMobile ? 'max-w-[95%]' : 'max-w-[80%]'
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

            {/* Text Content */}
            {isUser ? (
              <div className="whitespace-pre-wrap text-white text-sm sm:text-base">
                {message.content}
              </div>
            ) : (
              <div className="prose prose-sm sm:prose-base max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      
                      return !inline && match ? (
                        <div className="relative">
                          <CodeBlockCopy code={codeString} language={match[1]} isMobile={isMobile} />
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: '0.5rem',
                              fontSize: isMobile ? '12px' : '14px',
                            }}
                            {...props}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
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
                title="Copy entire message"
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