import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, User, Bot, Image, File, BarChart3, PieChart, Table, GitBranch } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Message } from '../types/chat';
import { cn } from '../utils/cn';
import { parseAIContent, type ParsedSection } from '../utils/contentParser';
import { MermaidDiagram } from './MermaidDiagram';
import { EnhancedTable } from './EnhancedTable';
import { ChartComponent } from './ChartComponent';

interface MessageBubbleProps {
  message: Message;
  isMobile?: boolean;
}

// Code Block Copy Component
function CodeBlockCopy({ code, language, isMobile = false }: { 
  code: string; 
  language: string; 
  isMobile?: boolean 
}) {
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

// Math Expression Component
function MathExpression({ expression, displayMode = 'inline' }: { 
  expression: string; 
  displayMode?: 'inline' | 'block' 
}) {
  return (
    <div className={`${displayMode === 'block' ? 'block my-4' : 'inline'}`}>
      <div className="bg-gray-50 border border-gray-200 rounded p-2 font-mono text-sm">
        {expression}
      </div>
    </div>
  );
}

// Content Summary Component
function ContentSummary({ sections }: { sections: ParsedSection[] }) {
  const summary = {
    hasDiagrams: sections.some(s => s.type === 'mermaid'),
    hasTables: sections.some(s => s.type === 'table'),
    hasCharts: sections.some(s => s.type === 'chart'),
    hasMath: sections.some(s => s.type === 'math'),
    hasCode: sections.some(s => s.type === 'code'),
  };

  const hasRichContent = Object.values(summary).some(Boolean);

  if (!hasRichContent) return null;

  return (
    <div className="flex items-center space-x-2 mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="text-xs font-medium text-blue-700">Content includes:</span>
      <div className="flex items-center space-x-1">
        {summary.hasDiagrams && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 rounded text-xs text-blue-700">
            <GitBranch className="h-3 w-3" />
            <span>Diagrams</span>
          </div>
        )}
        {summary.hasTables && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded text-xs text-green-700">
            <Table className="h-3 w-3" />
            <span>Tables</span>
          </div>
        )}
        {summary.hasCharts && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 rounded text-xs text-purple-700">
            <BarChart3 className="h-3 w-3" />
            <span>Charts</span>
          </div>
        )}
        {summary.hasMath && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 rounded text-xs text-orange-700">
            <span className="text-xs">∑</span>
            <span>Math</span>
          </div>
        )}
        {summary.hasCode && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
            <span className="text-xs">{'</>'}</span>
            <span>Code</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function EnhancedMessageBubble({ message, isMobile = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);

  useEffect(() => {
    if (message.role === 'assistant') {
      const sections = parseAIContent(message.content);
      setParsedSections(sections);
    }
  }, [message.content, message.role]);

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

  const renderContent = () => {
    if (isUser) {
      return (
        <div className="whitespace-pre-wrap text-white text-sm sm:text-base">
          {message.content}
        </div>
      );
    }

    // For AI responses, render enhanced content
    return (
      <div className="space-y-4">
        {/* Content Summary */}
        <ContentSummary sections={parsedSections} />

        {/* Render sections */}
        {parsedSections.map((section, index) => {
          switch (section.type) {
            case 'text':
              return (
                <div key={index} className="prose prose-sm sm:prose-base max-w-none">
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
                    {section.content}
                  </ReactMarkdown>
                </div>
              );

            case 'mermaid':
              return (
                <MermaidDiagram 
                  key={index} 
                  code={section.content} 
                  title="Flowchart Diagram"
                />
              );

            case 'table':
              return (
                <EnhancedTable 
                  key={index} 
                  data={section.content} 
                  headers={section.config?.headers || []} 
                  title="Data Table"
                />
              );

            case 'chart':
              return (
                <ChartComponent 
                  key={index}
                  type={section.config?.type}
                  data={section.content}
                  config={section.config}
                />
              );

            case 'math':
              return (
                <MathExpression 
                  key={index}
                  expression={section.content}
                  displayMode={section.config?.displayMode}
                />
              );

            case 'code':
              return (
                <div key={index} className="relative">
                  <CodeBlockCopy 
                    code={section.content} 
                    language={section.config?.language || 'text'} 
                    isMobile={isMobile} 
                  />
                  <SyntaxHighlighter
                    style={oneDark}
                    language={section.config?.language || 'text'}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                      fontSize: isMobile ? '12px' : '14px',
                    }}
                  >
                    {section.content}
                  </SyntaxHighlighter>
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
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

            {/* Enhanced Content */}
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