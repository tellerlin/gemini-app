import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AdvancedSettingsModal } from './components/AdvancedSettingsModal';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { ModelSwitchIndicator } from './components/ModelSwitchIndicator';
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
  } = useChat();

  // Handle responsive behavior
  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  // Close sidebar when clicking outside on mobile - optimized with useCallback
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (isMobile && sidebarOpen) {
      const target = event.target as Element;
      if (!target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
        setSidebarOpen(false);
      }
    }
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Optimized handlers with useCallback to prevent unnecessary re-renders
  const handleSaveApiKeys = useCallback((newApiKeys: string[]) => {
    setApiKeys(newApiKeys);
  }, [setApiKeys]);

  const handleConversationSelect = useCallback((id: string) => {
    selectConversation(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [selectConversation, isMobile]);

  // Optimize sidebar toggle handlers
  const handleSidebarOpen = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleApiKeyModalOpen = useCallback(() => {
    setApiKeyModalOpen(true);
  }, []);

  const handleApiKeyModalClose = useCallback(() => {
    setApiKeyModalOpen(false);
  }, []);

  const handleAdvancedSettingsOpen = useCallback(() => {
    setAdvancedSettingsOpen(true);
  }, []);

  const handleAdvancedSettingsClose = useCallback(() => {
    setAdvancedSettingsOpen(false);
  }, []);

  const handlePerformanceMonitorOpen = useCallback(() => {
    setPerformanceMonitorOpen(true);
  }, []);

  const handlePerformanceMonitorClose = useCallback(() => {
    setPerformanceMonitorOpen(false);
  }, []);

  // Optimized memoization for better performance
  const stableConversationConfig = useMemo(() => {
    return currentConversation?.config || defaultConversationConfig;
  }, [currentConversation?.config, defaultConversationConfig]);

  // Memoized export handler
  const handleExportConversation = useCallback((id: string, format: any) => {
    exportConversation(id, format);
  }, [exportConversation]);

  // Memoized hasApiKey to prevent array length check on every render
  const hasApiKey = useMemo(() => {
    return apiKeys && apiKeys.length > 0;
  }, [apiKeys]);

  // Memoized current conversation data
  const currentConversationData = useMemo(() => ({
    id: currentConversation?.id || null,
    title: currentConversation?.title || 'New Conversation',
    messages: currentConversation?.messages || []
  }), [currentConversation?.id, currentConversation?.title, currentConversation?.messages]);

  return (
    <GlobalErrorBoundary>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            maxWidth: '90vw',
            fontSize: '14px',
          },
        }}
      />

      {/* Main Application */}
        <>
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={handleSidebarClose}
            conversations={conversations}
            currentConversationId={currentConversationData.id}
            onSelectConversation={handleConversationSelect}
            onNewConversation={createNewConversation}
            onDeleteConversation={deleteConversation}
            onExportConversation={handleExportConversation}
            onOpenSettings={handleApiKeyModalOpen}
            onOpenAdvancedSettings={handleAdvancedSettingsOpen}
            onOpenPerformanceMonitor={handlePerformanceMonitorOpen}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isMobile={isMobile}
          />

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-white lg:hidden shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSidebarOpen}
                className="sidebar-toggle p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate px-2">
                {currentConversationData.title}
              </h1>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Chat Content */}
            <div className="flex-1 min-h-0 relative">
              <ChatArea
                messages={currentConversationData.messages}
                onSendMessage={sendMessage}
                onGenerateImage={generateImage}
                onStopGeneration={stopGeneration}
                isLoading={isLoading}
                isStreaming={isStreaming}
                streamingMessage={streamingMessage}
                hasApiKey={hasApiKey}
                isMobile={isMobile}
                conversationConfig={stableConversationConfig}
              />
            </div>
          </div>

          {/* API Key Modal */}
          <ApiKeyModal
            isOpen={apiKeyModalOpen}
            onClose={handleApiKeyModalClose}
            currentApiKeys={apiKeys}
            onSave={handleSaveApiKeys}
          />
          {/* Advanced Settings Modal */}
          <AdvancedSettingsModal
            isOpen={advancedSettingsOpen}
            onClose={handleAdvancedSettingsClose}
            conversationConfig={defaultConversationConfig}
            onSave={setDefaultConversationConfig}
          />
          {/* Performance Monitor */}
          <PerformanceMonitor
            isOpen={performanceMonitorOpen}
            onClose={handlePerformanceMonitorClose}
            getMetrics={getPerformanceMetrics}
          />
          
          {/* Model Switch Indicator */}
          <ModelSwitchIndicator />
        </>
      </div>
    </GlobalErrorBoundary>
  );
}

export default App;