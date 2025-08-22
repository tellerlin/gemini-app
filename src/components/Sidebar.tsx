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
  isDesktop?: boolean;
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
  isDesktop = false,
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
          isMobile ? 'w-80 sm:w-96' : isDesktop ? 'w-80 xl:w-96' : 'w-80',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with enhanced styling and logo */}
          <div className="flex items-center justify-between mobile-px-safe py-3 border-b border-slate-200/60 bg-gradient-to-r from-white/95 to-slate-50/95 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent">Gemini Chat</h1>
            </div>
            <button
              onClick={onClose}
              className="touch-target-xl rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white/80 transition-all duration-200 lg:hidden active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Model Selection with modern design */}
          <div className="mobile-px-safe py-3 border-b border-slate-200/60 bg-gradient-to-r from-blue-50/60 via-indigo-50/60 to-purple-50/60 backdrop-blur-sm">
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
          <div className={cn(
            "mobile-px-safe",
            isMobile ? "py-3" : "py-4"
          )}>
            <Button
              onClick={onNewConversation}
              className={cn(
                "w-full justify-start bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-semibold",
                "hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 shadow-lg hover:shadow-xl",
                "transform hover:-translate-y-0.5 transition-all duration-200",
                isMobile ? "text-sm py-3" : "text-sm py-3.5"
              )}
              variant="primary"
            >
              <Plus className={cn(
                "mr-3",
                isMobile ? "h-4 w-4" : "h-5 w-5"
              )} />
              <span className="font-semibold tracking-wide">
                New Conversation
              </span>
            </Button>
          </div>

          {/* Conversations List with enhanced design and minimal padding */}
          <div className="flex-1 overflow-y-auto px-2">
            <div className="space-y-1.5">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">No conversations yet</p>
                  <p className="text-xs text-slate-500">Start a new conversation to begin</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      'group flex items-center rounded-xl cursor-pointer transition-all duration-200 bg-white/80 hover:bg-white hover:shadow-md',
                      'transform hover:-translate-y-0.5 active:scale-[0.98]',
                      currentConversationId === conversation.id
                        ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300/60 shadow-md'
                        : 'border border-slate-200/60 hover:border-slate-300/80'
                    )}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    {/* Icon area with desktop and mobile responsive design */}
                    <div className={cn(
                      "flex items-center",
                      isMobile ? "py-2 pl-2" : "py-2.5 pl-3"
                    )}>
                      <div className={cn(
                        "rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-sm",
                        isMobile ? "w-3.5 h-3.5" : "w-4 h-4"
                      )}>
                        <MessageCircle className={cn(
                          "text-white",
                          isMobile ? "h-2 w-2" : "h-2.5 w-2.5"
                        )} />
                      </div>
                    </div>
                    
                    {/* Responsive text area */}
                    <div className={cn(
                      "flex-1 min-w-0",
                      isMobile ? "py-2 px-2" : "py-2.5 px-3"
                    )}>
                      <p className={cn(
                        "font-semibold text-slate-800 truncate leading-tight mb-0.5",
                        isMobile ? "text-sm" : "text-sm lg:text-base"
                      )}>
                        {conversation.title}
                      </p>
                      <p className={cn(
                        "text-slate-500 leading-tight font-medium",
                        isMobile ? "text-xs" : "text-xs lg:text-sm"
                      )}>
                        {formatDate(conversation.updatedAt)}
                      </p>
                    </div>
                    {/* Responsive action button area */}
                    <div className={cn(
                      "flex items-center opacity-0 group-hover:opacity-100 transition-all duration-200",
                      isMobile ? "py-2 pr-2" : "py-2.5 pr-2.5 space-x-1"
                    )}>
                      <div className="relative export-dropdown">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExportDropdownOpen(
                              exportDropdownOpen === conversation.id ? null : conversation.id
                            );
                          }}
                          className={cn(
                            "text-slate-500 hover:text-blue-600 transition-all duration-200 rounded-lg flex items-center justify-center hover:bg-blue-50/80 border border-transparent hover:border-blue-200/50",
                            isMobile ? "w-6 h-6" : "w-7 h-7"
                          )}
                          title="Export conversation"
                        >
                          <svg width={isMobile ? "10" : "12"} height={isMobile ? "10" : "12"} viewBox="0 0 12 12" fill="none" className="text-current">
                            <path d="M6 1v8M2.5 6.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        
                        {exportDropdownOpen === conversation.id && (
                          <div className={cn(
                            "absolute right-0 mt-1 bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl shadow-lg z-50",
                            isMobile ? "w-16" : "w-20"
                          )}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportConversation(conversation.id, 'txt');
                                setExportDropdownOpen(null);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 first:rounded-t-xl transition-colors duration-150"
                            >
                              TXT
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportConversation(conversation.id, 'html');
                                setExportDropdownOpen(null);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                            >
                              HTML
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportConversation(conversation.id, 'pdf');
                                setExportDropdownOpen(null);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 last:rounded-b-xl transition-colors duration-150"
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
                        className={cn(
                          "text-slate-500 hover:text-red-600 transition-all duration-200 rounded-lg flex items-center justify-center hover:bg-red-50/80 border border-transparent hover:border-red-200/50",
                          isMobile ? "w-6 h-6 ml-1" : "w-7 h-7 ml-1.5"
                        )}
                        title="Delete conversation"
                      >
                        <svg width={isMobile ? "8" : "10"} height={isMobile ? "8" : "10"} viewBox="0 0 10 10" fill="none" className="text-current">
                          <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Settings Buttons with enhanced design */}
          <div className={cn(
            "border-t border-slate-200/60 bg-gradient-to-r from-white/80 via-slate-50/80 to-white/80 backdrop-blur-sm",
            isMobile ? "mobile-px-safe py-3 space-y-2" : "px-4 py-4 space-y-2"
          )}>
            <Button
              onClick={onOpenSettings}
              variant="ghost"
              className={cn(
                "w-full justify-start font-semibold hover:bg-white/90 hover:border-slate-200/60 border border-transparent",
                isMobile ? "text-sm py-2.5" : "text-sm py-3",
                !hasApiKey && "animate-pulse bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 hover:from-amber-100 hover:via-yellow-100 hover:to-orange-100 text-amber-800 border-2 border-amber-300/60 shadow-md font-semibold"
              )}
            >
              <Settings className={cn(
                "mr-3",
                isMobile ? "h-4 w-4" : "h-4 w-4"
              )} />
              <span className="tracking-wide">
                API Settings
              </span>
            </Button>
            <Button
              onClick={onOpenAdvancedSettings}
              variant="ghost"
              className={cn(
                "w-full justify-start font-semibold hover:bg-white/90 hover:border-slate-200/60 border border-transparent",
                isMobile ? "text-sm py-2.5" : "text-sm py-3"
              )}
            >
              <Sliders className={cn(
                "mr-3",
                isMobile ? "h-4 w-4" : "h-4 w-4"
              )} />
              <span className="tracking-wide">
                Advanced Settings
              </span>
            </Button>
            <Button
              onClick={onOpenPerformanceMonitor}
              variant="ghost"
              className={cn(
                "w-full justify-start font-semibold hover:bg-white/90 hover:border-slate-200/60 border border-transparent",
                isMobile ? "text-sm py-2.5" : "text-sm py-3"
              )}
            >
              <Activity className={cn(
                "mr-3",
                isMobile ? "h-4 w-4" : "h-4 w-4"
              )} />
              <span className="tracking-wide">
                Performance Monitor
              </span>
            </Button>
            <Button
              onClick={() => window.open('https://github.com/tellerlin/gemini-app', '_blank')}
              variant="ghost"
              className={cn(
                "w-full justify-start font-semibold text-slate-600 hover:text-slate-800 hover:bg-white/90 hover:border-slate-200/60 border border-transparent",
                isMobile ? "text-sm py-2.5" : "text-sm py-3"
              )}
            >
              <Github className={cn(
                "mr-3",
                isMobile ? "h-4 w-4" : "h-4 w-4"
              )} />
              <span className="tracking-wide">
                View on GitHub
              </span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}