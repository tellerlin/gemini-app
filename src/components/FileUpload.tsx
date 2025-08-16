import React, { useCallback, useState } from 'react';
import { Upload, X, File, Image, Video, FileText } from 'lucide-react';
import type { FileAttachment } from '../types/chat';
import { cn } from '../utils/cn';

interface FileUploadProps {
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
  className?: string;
  isMobile?: boolean;
}

export function FileUpload({ files, onFilesChange, className, isMobile = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileRead = (file: File): Promise<FileAttachment> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment: FileAttachment = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          data: e.target?.result as string,
        };
        resolve(attachment);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: FileAttachment[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }
      
      const attachment = await handleFileRead(file);
      newFiles.push(attachment);
    }
    
    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* File Upload Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg transition-colors duration-200',
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          isMobile ? 'p-3' : 'p-4'
        )}
      >
        <label className="flex flex-col items-center justify-center cursor-pointer">
          <Upload className={cn("text-gray-400 mb-2", isMobile ? "h-6 w-6" : "h-8 w-8")} />
          <span className={cn("text-gray-600 text-center", isMobile ? "text-xs" : "text-sm")}>
            Drop files here or click to upload
          </span>
          <span className={cn("text-gray-400 mt-1 text-center", isMobile ? "text-xs" : "text-xs")}>
            Images, videos, PDFs, documents (max 10MB each)
          </span>
          <input
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          />
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "flex items-center space-x-2 sm:space-x-3 bg-gray-50 rounded-lg",
                isMobile ? "p-2" : "p-3"
              )}
            >
              {file.type.startsWith('image/') ? (
                <Image className={cn("text-blue-500", isMobile ? "h-3 w-3" : "h-4 w-4")} />
              ) : file.type.startsWith('video/') ? (
                <Video className={cn("text-purple-500", isMobile ? "h-3 w-3" : "h-4 w-4")} />
              ) : file.type === 'application/pdf' ? (
                <FileText className={cn("text-red-500", isMobile ? "h-3 w-3" : "h-4 w-4")} />
              ) : (
                <File className={cn("text-gray-500", isMobile ? "h-3 w-3" : "h-4 w-4")} />
              )}
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium text-gray-900 truncate", isMobile ? "text-xs" : "text-sm")}>
                  {file.name}
                </p>
                <p className={cn("text-gray-500", isMobile ? "text-xs" : "text-xs")}>
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className={cn(
                  "text-gray-400 hover:text-red-500 transition-colors active:scale-95 touch-manipulation",
                  isMobile ? "p-1" : "p-1"
                )}
              >
                <X className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}