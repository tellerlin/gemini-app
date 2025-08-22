import React, { useState, useEffect, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AdvancedSettingsModal } from './components/AdvancedSettingsModal';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { ModelSwitchIndicator } from './components/ModelSwitchIndicator';
import { MermaidDiagram } from './components/MermaidDiagram';
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

  const handleSaveApiKeys = (newApiKeys: string[]) => {
    setApiKeys(newApiKeys);
  };

  const handleConversationSelect = (id: string) => {
    selectConversation(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // 稳定化 conversationConfig 引用以避免不必要的重新渲染
  const stableConversationConfig = useMemo(() => {
    return currentConversation?.config || defaultConversationConfig;
  }, [currentConversation?.config, defaultConversationConfig]);

  // Memoize handlers to prevent unnecessary re-renders
  const memoizedHandlers = useMemo(() => ({
    handleSaveApiKeys: (newApiKeys: string[]) => {
      setApiKeys(newApiKeys);
    },
    handleConversationSelect: (id: string) => {
      selectConversation(id);
      if (isMobile) {
        setSidebarOpen(false);
      }
    },
  }), [setApiKeys, selectConversation, isMobile]);

  return (
    <GlobalErrorBoundary>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(55, 65, 81, 0.95)',
            color: '#fff',
            maxWidth: '90vw',
            fontSize: '14px',
            borderRadius: '12px',
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
            hasApiKey={apiKeys && apiKeys.length > 0}
          />

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Mobile Header with enhanced design */}
            <div className="flex items-center justify-between mobile-p-safe border-b bg-white/80 backdrop-blur-modern lg:hidden shadow-modern">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="sidebar-toggle touch-target hover:bg-white/60 rounded-xl transition-smooth"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-md flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs">G</span>
                </div>
                <h1 className="text-fluid-base font-semibold gradient-text truncate">
                  {currentConversation?.title || 'New Conversation'}
                </h1>
              </div>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Chat Content with enhanced styling */}
            <div className="flex-1 min-h-0 relative bg-gradient-to-b from-transparent to-white/20">
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
        </>
      </div>
    </GlobalErrorBoundary>
  );
}

export default App;