import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ApiKeyModal } from './components/ApiKeyModal';
import { useChat } from './hooks/useChat';
import { useResponsive } from './hooks/useLocalStorage';
import { Button } from './components/ui/Button';
import { cn } from './utils/cn';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const {
    conversations,
    currentConversation,
    isLoading,
    apiKeys,
    setApiKeys,
    selectedModel,
    setSelectedModel,
    sendMessage,
    createNewConversation,
    deleteConversation,
    selectConversation,
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

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        currentConversationId={currentConversation?.id || null}
        onSelectConversation={handleConversationSelect}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onOpenSettings={() => setApiKeyModalOpen(true)}
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
            isLoading={isLoading}
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
    </div>
  );
}

export default App;