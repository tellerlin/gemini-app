import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Button } from './ui/Button';
import { FileUpload } from './FileUpload';
import type { FileAttachment } from '../types/chat';
import { cn } from '../utils/cn';

interface ChatInputProps {
  onSendMessage: (content: string, files?: FileAttachment[]) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
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
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  return (
    <div className="border-t bg-white p-4">
      {/* File Upload Section */}
      {showFileUpload && (
        <div className="mb-4">
          <FileUpload
            files={files}
            onFilesChange={setFiles}
          />
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
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
                'w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'disabled:bg-gray-50 disabled:cursor-not-allowed',
                'placeholder-gray-500'
              )}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* File Upload Toggle */}
            <button
              type="button"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className={cn(
                'absolute right-2 top-1/2 transform -translate-y-1/2 p-2',
                'text-gray-400 hover:text-gray-600 transition-colors',
                showFileUpload && 'text-blue-500'
              )}
              title="Attach files"
            >
              {showFileUpload ? (
                <X className="h-4 w-4" />
              ) : (
                <Paperclip className="h-4 w-4" />
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

        {/* Send Button */}
        <Button
          type="submit"
          disabled={disabled || (!message.trim() && files.length === 0)}
          isLoading={isLoading}
          className="rounded-2xl h-12 w-12 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}