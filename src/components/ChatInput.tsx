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
    <div className="border-t border-slate-200/60 bg-white/90 backdrop-blur-sm mobile-px-safe py-3 shadow-lg">
      {/* File Upload Section */}
      {showFileUpload && (
        <div className="mb-3">
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
                'w-full px-4 py-3 pr-14 border border-slate-200/80 rounded-2xl resize-none',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'disabled:bg-slate-50 disabled:cursor-not-allowed',
                'placeholder-slate-500 text-slate-800 text-sm font-medium',
                'transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg',
                'bg-white/95 backdrop-blur-sm'
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
                'absolute right-3 top-1/2 transform -translate-y-1/2 touch-target mobile-interactive',
                'text-slate-500 hover:text-blue-600 transition-all duration-200 rounded-lg',
                'active:scale-95 hover:bg-blue-50/80 border border-transparent hover:border-blue-200/50',
                showFileUpload && 'text-blue-600 bg-blue-50/80 border-blue-200/50',
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
            <div className="mt-2 text-xs text-slate-600 font-medium">
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
                "rounded-2xl p-0 transition-all duration-200 active:scale-95 touch-manipulation mobile-interactive border-2 border-slate-300/80 hover:border-slate-400/80",
                isMobile ? "h-12 w-12 touch-target" : "h-14 w-14 hover:-translate-y-0.5"
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
              "rounded-2xl p-0 transition-all duration-200 active:scale-95 touch-manipulation mobile-interactive bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 shadow-lg hover:shadow-xl",
              isMobile ? "h-12 w-12 touch-target" : "h-14 w-14 hover:-translate-y-0.5"
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