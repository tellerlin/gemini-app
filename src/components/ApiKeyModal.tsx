import React, { useState } from 'react';
import { X, Key, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKeys: string[];
  onSave: (apiKeys: string[]) => void;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  currentApiKeys,
  onSave,
}: ApiKeyModalProps) {
  const [apiKeysText, setApiKeysText] = useState(currentApiKeys.join('\n'));

  if (!isOpen) return null;

  const handleSave = () => {
    const keys = apiKeysText
      .split('\n')
      .map(key => key.trim())
      .filter(key => key !== '');
    onSave(keys);
    onClose();
  };

  const handleAddKey = () => {
    setApiKeysText(prev => prev + '\n');
  };

  const handleClearKeys = () => {
    setApiKeysText('');
  };

  const validKeys = apiKeysText
    .split('\n')
    .map(key => key.trim())
    .filter(key => key !== '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">API Key Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              You need Google AI Studio API keys to use Gemini. Get yours for free:
            </p>
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
            >
              <span>Get API Key</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Gemini API Keys (one per line)
              </label>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddKey}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Line
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearKeys}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
            
            <textarea
              value={apiKeysText}
              onChange={(e) => setApiKeysText(e.target.value)}
              placeholder="Enter your Gemini API keys (one per line)..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {validKeys.length} valid key{validKeys.length !== 1 ? 's' : ''} detected
              </span>
              <span>
                Keys will be used in round-robin mode for better reliability
              </span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Round-robin functionality:</strong> If one API key fails, the system will automatically try the next key. 
              This provides better reliability and helps manage rate limits.
            </p>
          </div>

          <div className="text-xs text-gray-500">
            Your API keys are stored locally in your browser and never sent to our servers.
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={validKeys.length === 0}>
            Save API Keys ({validKeys.length})
          </Button>
        </div>
      </div>
    </div>
  );
}