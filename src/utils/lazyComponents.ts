import { lazy, Suspense } from 'react';
import { SmartLoadingIndicator } from '../components/SmartLoadingIndicator';

// Lazy load heavy components for better initial page load
export const LazyMermaidDiagram = lazy(() => 
  import('../components/OptimizedMermaidDiagram').then(module => ({
    default: module.OptimizedMermaidDiagram
  }))
);

export const LazyEnhancedTable = lazy(() => 
  import('../components/EnhancedTable').then(module => ({
    default: module.EnhancedTable
  }))
);

export const LazyPerformanceMonitor = lazy(() => 
  import('../components/PerformanceMonitor').then(module => ({
    default: module.PerformanceMonitor
  }))
);

export const LazyAdvancedSettingsModal = lazy(() => 
  import('../components/AdvancedSettingsModal').then(module => ({
    default: module.AdvancedSettingsModal
  }))
);

// HOC for consistent loading experience
export function withSuspense<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function SuspenseWrapper(props: T) {
    return (
      <Suspense 
        fallback={
          fallback || (
            <div className="flex items-center justify-center p-8">
              <SmartLoadingIndicator 
                isLoading={true}
                isStreaming={false}
                currentStatus="Loading component..."
                enableSmartIndicators={true}
              />
            </div>
          )
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };
}

// Pre-configured lazy components with loading fallbacks
export const SuspenseMermaidDiagram = withSuspense(LazyMermaidDiagram);
export const SuspenseEnhancedTable = withSuspense(LazyEnhancedTable);
export const SuspensePerformanceMonitor = withSuspense(LazyPerformanceMonitor);
export const SuspenseAdvancedSettingsModal = withSuspense(LazyAdvancedSettingsModal);