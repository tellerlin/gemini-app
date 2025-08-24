import React, { useState, useEffect, useRef } from 'react';
import { Square, Copy, Download } from 'lucide-react';
import { Button } from './ui/Button';

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
  onStop?: () => void;
  className?: string;
  enableTypewriter?: boolean;
}

export function StreamingMessage({ 
  content, 
  isStreaming, 
  onStop, 
  className = '',
  enableTypewriter = true
}: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  // Adjust typing speed based on device type
  const [typingSpeed] = useState(() => {
    if (isMobile()) {
      return 30; // Slower on mobile for better reliability
    }
    return 20; // milliseconds per character
  });

  // Use requestAnimationFrame for better mobile performance
  const updateContent = (targetIndex: number) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(() => {
      const now = performance.now();
      if (now - lastUpdateRef.current >= typingSpeed) {
        setDisplayedContent(content.slice(0, targetIndex));
        setCurrentIndex(targetIndex);
        lastUpdateRef.current = now;
        
        if (targetIndex < content.length) {
          updateContent(targetIndex + 1);
        }
      } else {
        // If not enough time has passed, schedule next frame
        updateContent(targetIndex);
      }
    });
  };

  // Typewriter effect with mobile optimization
  useEffect(() => {
    if (!enableTypewriter || !isStreaming) {
      // If typewriter is disabled or not streaming, show all content immediately
      setDisplayedContent(content);
      setCurrentIndex(content.length);
      return;
    }

    if (isStreaming && content && currentIndex < content.length) {
      if (isMobile()) {
        // Use requestAnimationFrame on mobile for better performance
        updateContent(currentIndex + 1);
      } else {
        // Use setTimeout on desktop for precise timing
        intervalRef.current = setTimeout(() => {
          setDisplayedContent(content.slice(0, currentIndex + 1));
          setCurrentIndex(prev => prev + 1);
        }, typingSpeed);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [content, currentIndex, isStreaming, typingSpeed, enableTypewriter]);

  // Reset when new content starts
  useEffect(() => {
    if (isStreaming && content.length < displayedContent.length) {
      setDisplayedContent('');
      setCurrentIndex(0);
      lastUpdateRef.current = 0;
    }
  }, [content, isStreaming, displayedContent.length]);

  // Enhanced clipboard API with fallback for mobile
  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(displayedContent);
      } else {
        // Fallback for mobile browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = displayedContent;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadAsText = () => {
    const blob = new Blob([displayedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="prose prose-gray max-w-none">
        <div className="whitespace-pre-wrap break-words">
          {displayedContent}
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse" />
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        {isStreaming && onStop && (
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Square className="h-3 w-3 mr-1" />
            Stop Generation
          </Button>
        )}
        
        {!isStreaming && displayedContent && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="text-gray-500 hover:text-gray-700"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadAsText}
              className="text-gray-500 hover:text-gray-700"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </>
        )}
      </div>

      {/* Streaming indicator */}
      {isStreaming && (
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>Generating response...</span>
        </div>
      )}
    </div>
  );
}