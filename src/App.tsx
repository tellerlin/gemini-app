import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AdvancedSettingsModal } from './components/AdvancedSettingsModal';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { MermaidTest } from './components/MermaidTest';
import { useChat } from './hooks/useChat';
import { useResponsive } from './hooks/useLocalStorage';
import { Button } from './components/ui/Button';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [performanceMonitorOpen, setPerformanceMonitorOpen] = useState(false);
  const [testMode, setTestMode] = useState(window.location.hash === '#test');
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
    defaultImageConfig,
    setDefaultImageConfig,
    getPerformanceMetrics,
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

  return (
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

      {/* Test Mode */}
      {testMode ? (
        <div className="w-full h-full overflow-auto">
          <div className="p-4">
            <button 
              onClick={() => setTestMode(false)}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              返回主应用
            </button>
            <MermaidTest />
          </div>
        </div>
      ) : (
        <>
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            conversations={conversations}
            currentConversationId={currentConversation?.id || null}
            onSelectConversation={handleConversationSelect}
            onNewConversation={createNewConversation}
            onDeleteConversation={deleteConversation}
            onExportConversation={exportConversation}
            onOpenSettings={() => setApiKeyModalOpen(true)}
            onOpenAdvancedSettings={() => setAdvancedSettingsOpen(true)}
            onOpenPerformanceMonitor={() => setPerformanceMonitorOpen(true)}
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
                onClick={() => setSidebarOpen(true)}
                className="sidebar-toggle p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate px-2">
                {currentConversation?.title || 'New Conversation'}
              </h1>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Chat Content */}
            <div className="flex-1 min-h-0 relative">
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
              />
            </div>
          </div>

          {/* API Key Modal */}
          <ApiKeyModal
            isOpen={apiKeyModalOpen}
            onClose={() => setApiKeyModalOpen(false)}
            currentApiKeys={apiKeys}
            onSave={handleSaveApiKeys}
          />
          {/* Advanced Settings Modal */}
          <AdvancedSettingsModal
            isOpen={advancedSettingsOpen}
            onClose={() => setAdvancedSettingsOpen(false)}
            conversationConfig={defaultConversationConfig}
            onSave={setDefaultConversationConfig}
            imageConfig={defaultImageConfig}
            onImageConfigSave={setDefaultImageConfig}
          />
          {/* Performance Monitor */}
          <PerformanceMonitor
            isOpen={performanceMonitorOpen}
            onClose={() => setPerformanceMonitorOpen(false)}
            getMetrics={getPerformanceMetrics}
          />
        </>
      )}
    </div>
  );
}

export default App;