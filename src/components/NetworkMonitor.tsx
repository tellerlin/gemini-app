import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

// Network status monitoring for mobile devices
export function NetworkMonitor() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    // Check connection type if available (mainly on mobile)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      setConnectionType(connection.effectiveType);
    }

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('网络连接已恢复', {
        duration: 3000,
        icon: '🌐',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('网络连接已断开，请检查您的网络连接', {
        duration: 5000,
        icon: '📶',
      });
    };

    const handleConnectionChange = () => {
      if (connection) {
        const newType = connection.effectiveType;
        if (newType !== connectionType) {
          setConnectionType(newType);
          
          // Notify user about slow connections
          if (newType === 'slow-2g' || newType === '2g') {
            toast('网络连接较慢，消息可能有延迟', {
              duration: 4000,
              icon: '🐌',
            });
          } else if (newType === '3g' && connectionType === '4g') {
            toast('网络速度已降低', {
              duration: 3000,
              icon: '📱',
            });
          } else if (newType === '4g' && (connectionType === '3g' || connectionType === '2g' || connectionType === 'slow-2g')) {
            toast.success('网络连接已改善', {
              duration: 3000,
              icon: '🚀',
            });
          }
        }
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [connectionType]);

  // Show persistent warning for offline state
  useEffect(() => {
    let toastId: string | undefined;
    
    if (!isOnline) {
      toastId = toast.error('设备已离线，请检查网络连接', {
        duration: Infinity,
        icon: '📶',
      });
    }

    return () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, [isOnline]);

  return null; // This component doesn't render anything visible
}

// Hook for components to use network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      setConnectionType(connection.effectiveType);
      setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    }

    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    const updateConnection = () => {
      if (connection) {
        const type = connection.effectiveType;
        setConnectionType(type);
        setIsSlowConnection(type === 'slow-2g' || type === '2g');
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    if (connection) {
      connection.addEventListener('change', updateConnection);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateConnection);
      }
    };
  }, []);

  return { isOnline, connectionType, isSlowConnection };
}

// Utility to add retry logic for network requests
export class NetworkRetry {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      delay?: number;
      backoffMultiplier?: number;
      onRetry?: (attempt: number, error: any) => void;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      delay = 1000,
      backoffMultiplier = 2,
      onRetry
    } = options;

    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }

        if (onRetry) {
          onRetry(attempt + 1, error);
        }

        // Wait before retrying, with exponential backoff
        const waitTime = delay * Math.pow(backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError;
  }

  // Specialized retry for streaming operations
  static async retryStream<T>(
    streamOperation: () => AsyncGenerator<T>,
    options: {
      maxRetries?: number;
      onRetry?: (attempt: number, error: any) => void;
      onReconnect?: () => void;
    } = {}
  ): Promise<AsyncGenerator<T>> {
    const { maxRetries = 2, onRetry, onReconnect } = options;
    
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      try {
        return streamOperation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        if (onRetry) {
          onRetry(attempt + 1, error);
        }
        
        if (onReconnect) {
          onReconnect();
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        attempt++;
      }
    }
    
    throw new Error('Stream retry failed');
  }
}