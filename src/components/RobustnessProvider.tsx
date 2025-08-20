import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface RobustnessContextType {
  reportError: (error: Error, context?: string) => void;
  isOnline: boolean;
  retryOperation: <T>(operation: () => Promise<T>, maxRetries?: number) => Promise<T>;
  networkStatus: 'online' | 'offline' | 'slow';
}

const RobustnessContext = createContext<RobustnessContextType | null>(null);

interface RobustnessProviderProps {
  children: ReactNode;
}

export function RobustnessProvider({ children }: RobustnessProviderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'slow'>('online');

  // Network monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkStatus('online');
      toast.success('Connection restored', { id: 'network-status' });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkStatus('offline');
      toast.error('No internet connection', { 
        id: 'network-status',
        duration: Infinity,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Network speed detection
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const updateNetworkStatus = () => {
        if (!isOnline) {
          setNetworkStatus('offline');
          return;
        }

        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setNetworkStatus('slow');
        } else {
          setNetworkStatus('online');
        }
      };

      connection.addEventListener('change', updateNetworkStatus);
      updateNetworkStatus();

      return () => {
        connection.removeEventListener('change', updateNetworkStatus);
      };
    }
  }, [isOnline]);

  const reportError = useCallback((error: Error, context?: string) => {
    console.error('Robustness Provider Error:', {
      error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Show user-friendly error message
    toast.error(`Something went wrong${context ? `: ${context}` : ''}`, {
      duration: 5000,
    });
  }, []);

  const retryOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          toast(`Retrying... (${attempt}/${maxRetries})`, {
            duration: 2000,
          });
        }
      }
    }
    
    throw lastError!;
  }, []);

  const value: RobustnessContextType = {
    reportError,
    isOnline,
    retryOperation,
    networkStatus,
  };

  return (
    <RobustnessContext.Provider value={value}>
      {children}
    </RobustnessContext.Provider>
  );
}

export function useRobustness() {
  const context = useContext(RobustnessContext);
  if (!context) {
    throw new Error('useRobustness must be used within a RobustnessProvider');
  }
  return context;
}

// Higher-order component for automatic error boundary
export function withRobustness<P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
) {
  const WrappedComponent = (props: P) => {
    const { reportError } = useRobustness();

    useEffect(() => {
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        reportError(
          new Error(event.reason?.message || 'Unhandled promise rejection'),
          `${displayName || Component.name} - Unhandled Promise`
        );
      };

      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }, [reportError]);

    try {
      return <Component {...props} />;
    } catch (error) {
      reportError(
        error as Error,
        `${displayName || Component.name} - Render Error`
      );
      return null;
    }
  };

  WrappedComponent.displayName = `withRobustness(${displayName || Component.displayName || Component.name})`;
  return WrappedComponent;
}