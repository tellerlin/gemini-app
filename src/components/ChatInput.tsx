import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Image } from 'lucide-react';
import { Button } from './ui/Button';
import { FileUpload } from './FileUpload';
import type { FileAttachment } from '../types/chat';
import { cn } from '../utils/cn';

interface ChatInputProps {
  onSendMessage: (content: string, files?: FileAttachment[]) => void;
  onGenerateImage?: (content: string, files?: FileAttachment[]) => void;
  isLoading: boolean;
  disabled?: boolean;
  isMobile?: boolean;
}

export function ChatInput({ onSendMessage, onGenerateImage, isLoading, disabled, isMobile = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;

    onSendMessage(message, files);
    setMessage('');
    setFiles([]);
    setShowFileUpload(false);
  };

  const handleGenerateImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;
    if (!onGenerateImage) return;

    onGenerateImage(message, files);
    setMessage('');
    setFiles([]);
    setShowFileUpload(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, isMobile ? 100 : 120) + 'px';
    }
  }, [message, isMobile]);

  return (
    <div className="border-t border-white/40 bg-white/80 backdrop-blur-modern mobile-p-safe shadow-modern">
      {/* File Upload Section */}
      {showFileUpload && (
        <div className="mb-4">
          <FileUpload
            files={files}
            onFilesChange={setFiles}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Input Form with enhanced styling */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={disabled}
              rows={1}
              className={cn(
                'w-full px-4 py-3 pr-14 border border-white/40 rounded-2xl resize-none',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'disabled:bg-gray-50 disabled:cursor-not-allowed',
                'placeholder-gray-500 mobile-text-enhanced',
                'transition-smooth shadow-modern hover:shadow-modern-hover',
                'bg-white/90 backdrop-blur-sm'
              )}
              style={{ 
                minHeight: isMobile ? '48px' : '52px', 
                maxHeight: isMobile ? '120px' : '140px' 
              }}
            />
            
            {/* File Upload Toggle with enhanced design */}
            <button
              type="button"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className={cn(
                'absolute right-2 top-1/2 transform -translate-y-1/2 touch-target mobile-interactive',
                'text-gray-400 hover:text-blue-500 transition-smooth rounded-lg',
                'active:scale-95 hover:bg-blue-50/60',
                showFileUpload && 'text-blue-500 bg-blue-50/60',
                isMobile && 'touch-target-xl'
              )}
              title="Attach files"
            >
              {showFileUpload ? (
                <X className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
              ) : (
                <Paperclip className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
              )}
            </button>
          </div>

          {/* File Count Indicator */}
          {files.length > 0 && (
            <div className="mt-1 text-xs text-gray-500">
              {files.length} file{files.length > 1 ? 's' : ''} attached
            </div>
          )}
        </div>

        {/* Send and Generate Image Buttons */}
        <div className={cn(
          "flex",
          isMobile ? "space-x-2" : "space-x-3"
        )}>
          {/* Generate Image Button */}
          {onGenerateImage && (
            <Button
              type="button"
              onClick={handleGenerateImage}
              disabled={disabled || (!message.trim() && files.length === 0)}
              isLoading={isLoading}
              variant="outline"
              className={cn(
                "rounded-2xl p-0 transition-all duration-200 active:scale-95 touch-manipulation mobile-interactive",
                isMobile ? "h-12 w-12 touch-target" : "h-14 w-14 hover:scale-105"
              )}
              title="Generate Image"
            >
              <Image className={cn(
                isMobile ? "h-4 w-4" : "h-5 w-5"
              )} />
            </Button>
          )}

          {/* Send Button */}
          <Button
            type="submit"
            disabled={disabled || (!message.trim() && files.length === 0)}
            isLoading={isLoading}
            className={cn(
              "rounded-2xl p-0 transition-all duration-200 active:scale-95 touch-manipulation mobile-interactive",
              isMobile ? "h-12 w-12 touch-target" : "h-14 w-14 hover:scale-105"
            )}
          >
            <Send className={cn(
              isMobile ? "h-4 w-4" : "h-5 w-5"
            )} />
          </Button>
        </div>
      </form>
    </div>
  );
}