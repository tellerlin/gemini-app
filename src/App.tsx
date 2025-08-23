import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AdvancedSettingsModal } from './components/AdvancedSettingsModal';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { ModelSwitchIndicator } from './components/ModelSwitchIndicator';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { useChat } from './hooks/useChat';
import { useResponsive } from './hooks/useLocalStorage';
import { Button } from './components/ui/Button';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [performanceMonitorOpen, setPerformanceMonitorOpen] = useState(false);
  const { isMobile, isDesktop } = useResponsive();
  
  const {
    conversations,
    currentConversation,
    isLoading,
    isStreaming,
    streamingMessage,
    apiKeys,
    setApiKeys,
    selectedModel,
    setSelectedModel,
    sendMessage,
    generateImage,
    stopGeneration,
    createNewConversation,
    deleteConversation,
    selectConversation,
    exportConversation,
    defaultConversationConfig,
    setDefaultConversationConfig,
    getPerformanceMetrics,
    resetPerformanceMetrics,
  } = useChat();

  // Handle responsive behavior
  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const target = event.target as Element;
        if (!target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const handleConversationSelect = useCallback((id: string) => {
    selectConversation(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [selectConversation, isMobile]);

  // Stabilize conversationConfig reference to avoid unnecessary re-renders
  const stableConversationConfig = useMemo(() => {
    return currentConversation?.config || defaultConversationConfig;
  }, [currentConversation?.config, defaultConversationConfig]);

  // Memoize handlers to prevent unnecessary re-renders
  const memoizedHandlers = useMemo(() => ({
    handleSaveApiKeys: (newApiKeys: string[]) => {
      setApiKeys(newApiKeys);
    },
    handleConversationSelect,
  }), [setApiKeys, handleConversationSelect]);

  return (
    <GlobalErrorBoundary>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#fff',
            maxWidth: '90vw',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          },
        }}
      />

      {/* Main Application */}
        <>
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            conversations={conversations}
            currentConversationId={currentConversation?.id || null}
            onSelectConversation={memoizedHandlers.handleConversationSelect}
            onNewConversation={createNewConversation}
            onDeleteConversation={deleteConversation}
            onExportConversation={(id, format) => exportConversation(id, format)}
            onOpenSettings={() => setApiKeyModalOpen(true)}
            onOpenAdvancedSettings={() => setAdvancedSettingsOpen(true)}
            onOpenPerformanceMonitor={() => setPerformanceMonitorOpen(true)}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isMobile={isMobile}
            isDesktop={isDesktop}
            hasApiKey={apiKeys && apiKeys.length > 0}
          />

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Mobile Header with enhanced design */}
            <div className="flex items-center justify-between mobile-px-safe py-3 border-b bg-white/90 backdrop-blur-sm lg:hidden shadow-sm border-slate-200/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="sidebar-toggle touch-target-xl hover:bg-white/80 rounded-xl transition-all duration-200 mobile-interactive font-semibold"
              >
                <Menu className="h-6 w-6 text-slate-700" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg">
                  <img 
                    src="/favicon/favicon-32x32.png" 
                    alt="Gemini Chat" 
                    className="w-8 h-8 rounded-xl"
                  />
                </div>
                <h1 className="text-base font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent truncate">
                  {currentConversation?.title || 'New Conversation'}
                </h1>
              </div>
              <div className="w-12" />
            </div>

            {/* Chat Content with enhanced styling */}
            <div className="flex-1 min-h-0 relative bg-gradient-to-b from-transparent via-white/10 to-white/30">
              <ChatArea
                messages={currentConversation?.messages || []}
                onSendMessage={sendMessage}
                onGenerateImage={generateImage}
                onStopGeneration={stopGeneration}
                isLoading={isLoading}
                isStreaming={isStreaming}
                streamingMessage={streamingMessage}
                hasApiKey={apiKeys && apiKeys.length > 0}
                isMobile={isMobile}
                conversationConfig={stableConversationConfig}
              />
            </div>
          </div>

          {/* API Key Modal */}
          <ApiKeyModal
            isOpen={apiKeyModalOpen}
            onClose={() => setApiKeyModalOpen(false)}
            currentApiKeys={apiKeys}
            onSave={memoizedHandlers.handleSaveApiKeys}
          />
          {/* Advanced Settings Modal */}
          <AdvancedSettingsModal
            isOpen={advancedSettingsOpen}
            onClose={() => setAdvancedSettingsOpen(false)}
            conversationConfig={defaultConversationConfig}
            onSave={setDefaultConversationConfig}
          />
          {/* Performance Monitor */}
          <PerformanceMonitor
            isOpen={performanceMonitorOpen}
            onClose={() => setPerformanceMonitorOpen(false)}
            getMetrics={getPerformanceMetrics}
            onResetMetrics={resetPerformanceMetrics}
          />
          
          {/* Model Switch Indicator */}
          <ModelSwitchIndicator />
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
        </>
      </div>
    </GlobalErrorBoundary>
  );
}

export default App;