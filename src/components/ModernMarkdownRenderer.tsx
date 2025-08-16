import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import { OptimizedMermaidDiagram } from './OptimizedMermaidDiagram';
import { CodeBlockCopy } from './CodeBlockCopy';
import { cn } from '../utils/cn';

interface ModernMarkdownRendererProps {
  content: string;
  isMobile?: boolean;
  enableCopy?: boolean;
  enableExport?: boolean;
  className?: string;
}

export function ModernMarkdownRenderer({ 
  content, 
  isMobile = false, 
  enableCopy = true,
  enableExport = false,
  className 
}: ModernMarkdownRendererProps) {
  
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      const language = match?.[1] || 'text';
      
      // Handle Mermaid diagrams
      if (!inline && language === 'mermaid') {
        return (
          <OptimizedMermaidDiagram 
            code={codeString} 
            enableExport={enableExport}
          />
        );
      }
      
      // Handle regular code blocks
      if (!inline && match) {
        return (
          <div className="relative group">
            {enableCopy && (
              <CodeBlockCopy 
                code={codeString} 
                language={language} 
                isMobile={isMobile} 
              />
            )}
            <SyntaxHighlighter
              style={oneDark}
              language={language}
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
        );
      }
      
      // Inline code
      return (
        <code 
          className={cn(
            "bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono",
            className
          )} 
          {...props}
        >
          {children}
        </code>
      );
    },
    
    // Math expressions are automatically handled by rehype-katex
    // Block math: $$...$$
    // Inline math: $...$
    
    // Custom table styling
    table({ children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-4">
          <table 
            className="min-w-full border border-gray-200 rounded-lg overflow-hidden"
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },
    
    thead({ children, ...props }: any) {
      return (
        <thead className="bg-gray-50" {...props}>
          {children}
        </thead>
      );
    },
    
    th({ children, ...props }: any) {
      return (
        <th 
          className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b border-gray-200"
          {...props}
        >
          {children}
        </th>
      );
    },
    
    td({ children, ...props }: any) {
      return (
        <td 
          className="px-4 py-2 text-sm text-gray-900 border-b border-gray-100"
          {...props}
        >
          {children}
        </td>
      );
    },
    
    // Enhanced blockquote styling
    blockquote({ children, ...props }: any) {
      return (
        <blockquote 
          className="border-l-4 border-blue-400 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic"
          {...props}
        >
          {children}
        </blockquote>
      );
    }
  };

  return (
    <div className={cn("prose prose-sm sm:prose-base max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}