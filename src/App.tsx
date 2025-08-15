import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ApiKeyModal } from './components/ApiKeyModal';
import { useChat } from './hooks/useChat';
import { Button } from './components/ui/Button';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  
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

  const handleSaveApiKeys = (newApiKeys: string[]) => {
    setApiKeys(newApiKeys);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        currentConversationId={currentConversation?.id || null}
        onSelectConversation={selectConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onOpenSettings={() => setApiKeyModalOpen(true)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {currentConversation?.title || 'New Conversation'}
          </h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Chat Content */}
        <div className="flex-1 min-h-0">
          <ChatArea
            messages={currentConversation?.messages || []}
            onSendMessage={sendMessage}
            isLoading={isLoading}
            hasApiKey={apiKeys && apiKeys.length > 0}
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