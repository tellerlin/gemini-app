import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Plus, Settings, X, Sliders, Activity, Github } from 'lucide-react';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import type { Conversation } from '../types/chat';
import { GEMINI_MODELS } from '../config/gemini';
import { cn } from '../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onExportConversation: (id: string, format?: 'txt' | 'html' | 'pdf') => void;
  onOpenSettings: () => void;
  onOpenAdvancedSettings: () => void;
  onOpenPerformanceMonitor: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  isMobile?: boolean;
  hasApiKey: boolean;
}

export function Sidebar({
  isOpen,
  onClose,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onExportConversation,
  onOpenSettings,
  onOpenAdvancedSettings,
  onOpenPerformanceMonitor,
  selectedModel,
  onModelChange,
  isMobile = false,
  hasApiKey,
}: SidebarProps) {
  const [exportDropdownOpen, setExportDropdownOpen] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.export-dropdown')) {
          setExportDropdownOpen(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportDropdownOpen]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar with enhanced design */}
      <div
        className={cn(
          'sidebar fixed top-0 left-0 h-full bg-white/90 backdrop-blur-modern shadow-modern transform transition-smooth z-50',
          'lg:relative lg:translate-x-0 lg:shadow-modern lg:border-r lg:border-white/20',
          isMobile ? 'w-80 sm:w-96' : 'w-80',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with enhanced styling and logo */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/20 bg-gradient-to-r from-white/80 to-white/60">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-modern">
                <span className="text-white font-bold text-xs">G</span>
              </div>
              <h1 className="text-base font-bold gradient-text">Gemini Chat</h1>
            </div>
            <button
              onClick={onClose}
              className="touch-target rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-smooth lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Model Selection with modern design */}
          <div className="px-3 py-2 border-b border-white/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <Select
              label="Model"
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              options={GEMINI_MODELS.map(model => ({
                value: model.id,
                label: model.name,
              }))}
            />
          </div>

          {/* New Conversation Button with enhanced style */}
          <div className="px-3 py-2">
            <Button
              onClick={onNewConversation}
              className="w-full justify-start btn-modern bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] shadow-modern"
              variant="primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </div>

          {/* Conversations List with enhanced design and minimal padding */}
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="mobile-text-enhanced font-medium">No conversations yet</p>
                  <p className="mobile-text-sm-enhanced">Start a new conversation to begin</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      'group flex items-center rounded-xl cursor-pointer transition-smooth card-modern',
                      'hover:shadow-modern-hover active:scale-[0.98]',
                      currentConversationId === conversation.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-modern'
                        : 'bg-white/60 hover:bg-white/80 border border-white/40'
                    )}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    {/* 极小的左侧图标 - 减少所有padding */}
                    <div className="flex items-center py-1 pl-1.5">
                      <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-2 w-2 text-white" />
                      </div>
                    </div>
                    
                    {/* 最大化的文字区域 - 减少padding */}
                    <div className="flex-1 min-w-0 py-1 px-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate leading-tight mb-0.5">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-gray-500 leading-tight">
                        {formatDate(conversation.updatedAt)}
                      </p>
                    </div>
                    {/* 极小的操作按钮区域 - 减少所有padding */}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-smooth py-1 pr-1">
                      <div className="relative export-dropdown">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExportDropdownOpen(
                              exportDropdownOpen === conversation.id ? null : conversation.id
                            );
                          }}
                          className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-smooth rounded flex items-center justify-center hover:bg-white/60"
                          title="Export conversation"
                        >
                          {/* 自定义下载图标 - 更小尺寸 */}
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-current">
                            <path d="M4 0.5v5M1.5 3.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        
                        {exportDropdownOpen === conversation.id && (
                          <div className="absolute right-0 mt-1 w-14 bg-white/95 backdrop-blur-modern border border-white/40 rounded-lg shadow-modern z-50">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportConversation(conversation.id, 'txt');
                                setExportDropdownOpen(null);
                              }}
                              className="w-full px-1.5 py-1 text-left text-xs text-gray-700 hover:bg-white/80 first:rounded-t-lg transition-smooth"
                            >
                              TXT
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportConversation(conversation.id, 'html');
                                setExportDropdownOpen(null);
                              }}
                              className="w-full px-1.5 py-1 text-left text-xs text-gray-700 hover:bg-white/80 transition-smooth"
                            >
                              HTML
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportConversation(conversation.id, 'pdf');
                                setExportDropdownOpen(null);
                              }}
                              className="w-full px-1.5 py-1 text-left text-xs text-gray-700 hover:bg-white/80 last:rounded-b-lg transition-smooth"
                            >
                              PDF
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className="w-4 h-4 text-gray-400 hover:text-red-500 transition-smooth rounded flex items-center justify-center hover:bg-red-50/80 ml-0.5"
                        title="Delete conversation"
                      >
                        {/* 自定义删除图标 - 更小尺寸 */}
                        <svg width="6" height="6" viewBox="0 0 6 6" fill="none" className="text-current">
                          <path d="M0.5 0.5l5 5M5.5 0.5l-5 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Settings Buttons with enhanced design */}
          <div className="px-3 py-2 border-t border-white/20 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm space-y-1">
            <Button
              onClick={onOpenSettings}
              variant="ghost"
              className={cn(
                "w-full justify-start btn-modern hover:bg-white/60 text-xs py-1.5",
                !hasApiKey && "animate-pulse bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 text-yellow-700 border border-yellow-200 shadow-modern"
              )}
            >
              <Settings className="h-3 w-3 mr-1.5" />
              API Settings
            </Button>
            <Button
              onClick={onOpenAdvancedSettings}
              variant="ghost"
              className="w-full justify-start btn-modern hover:bg-white/60 text-xs py-1.5"
            >
              <Sliders className="h-3 w-3 mr-1.5" />
              Advanced Settings
            </Button>
            <Button
              onClick={onOpenPerformanceMonitor}
              variant="ghost"
              className="w-full justify-start btn-modern hover:bg-white/60 text-xs py-1.5"
            >
              <Activity className="h-3 w-3 mr-1.5" />
              Performance Monitor
            </Button>
            <Button
              onClick={() => window.open('https://github.com/tellerlin/gemini-app', '_blank')}
              variant="ghost"
              className="w-full justify-start btn-modern text-gray-600 hover:text-gray-900 hover:bg-white/60 text-xs py-1.5"
            >
              <Github className="h-3 w-3 mr-1.5" />
              View on GitHub
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}