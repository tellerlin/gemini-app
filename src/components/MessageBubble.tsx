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
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
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
      'flex w-full mb-6',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'flex max-w-[80%] space-x-3',
        isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-blue-600' : 'bg-gray-600'
        )}>
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={cn(
          'flex flex-col min-w-0',
          isUser ? 'items-end' : 'items-start'
        )}>
          <div className={cn(
            'rounded-2xl px-4 py-3 shadow-sm',
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200'
          )}>
            {/* Files */}
            {message.files && message.files.length > 0 && (
              <div className="mb-3 space-y-2">
                {message.files.map((file) => (
                  <div key={file.id} className="flex items-center space-x-2">
                    {file.type.startsWith('image/') ? (
                      <>
                        <Image className="h-4 w-4" />
                        <img
                          src={file.url}
                          alt={file.name}
                          className="max-w-48 max-h-48 rounded-lg object-cover"
                        />
                      </>
                    ) : (
                      <>
                        <File className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Text Content */}
            {isUser ? (
              <div className="whitespace-pre-wrap text-white">
                {message.content}
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
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
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy message"
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