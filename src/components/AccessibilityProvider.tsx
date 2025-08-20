import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface AccessibilityContextType {
  isHighContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (selector: string) => void;
  keyboardNavigation: boolean;
  screenReaderMode: boolean;
  setFontSize: (size: 'small' | 'medium' | 'large' | 'xl') => void;
  setHighContrast: (enabled: boolean) => void;
  enableKeyboardNavigation: () => void;
  disableKeyboardNavigation: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    return localStorage.getItem('accessibility-high-contrast') === 'true';
  });
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xl'>(() => {
    return (localStorage.getItem('accessibility-font-size') as 'small' | 'medium' | 'large' | 'xl') || 'medium';
  });
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  // Screen reader detection
  useEffect(() => {
    const detectScreenReader = () => {
      const hasScreenReader = 
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        window.speechSynthesis?.getVoices().length > 0 ||
        !!(window as any).speechSynthesis;
      
      setScreenReaderMode(hasScreenReader);
    };

    detectScreenReader();
    
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', detectScreenReader);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', detectScreenReader);
      };
    }
  }, []);

  // Keyboard navigation detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardNavigation(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardNavigation(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', isHighContrast);
    document.documentElement.classList.toggle('keyboard-navigation', keyboardNavigation);
    document.documentElement.setAttribute('data-font-size', fontSize);
    
    localStorage.setItem('accessibility-high-contrast', isHighContrast.toString());
    localStorage.setItem('accessibility-font-size', fontSize);
  }, [isHighContrast, keyboardNavigation, fontSize]);

  // Screen reader announcements
  const announceMessage = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Focus management
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      announceMessage(`Focused on ${element.textContent || element.getAttribute('aria-label') || 'element'}`);
    }
  }, [announceMessage]);

  const enableKeyboardNavigation = useCallback(() => {
    setKeyboardNavigation(true);
  }, []);

  const disableKeyboardNavigation = useCallback(() => {
    setKeyboardNavigation(false);
  }, []);

  const handleSetFontSize = useCallback((size: 'small' | 'medium' | 'large' | 'xl') => {
    setFontSize(size);
    announceMessage(`Font size changed to ${size}`);
  }, [announceMessage]);

  const handleSetHighContrast = useCallback((enabled: boolean) => {
    setIsHighContrast(enabled);
    announceMessage(`High contrast mode ${enabled ? 'enabled' : 'disabled'}`);
  }, [announceMessage]);

  const value: AccessibilityContextType = {
    isHighContrast,
    fontSize,
    announceMessage,
    focusElement,
    keyboardNavigation,
    screenReaderMode,
    setFontSize: handleSetFontSize,
    setHighContrast: handleSetHighContrast,
    enableKeyboardNavigation,
    disableKeyboardNavigation,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Enhanced focus management hook
export function useFocusManagement() {
  const { announceMessage, focusElement } = useAccessibility();

  const trapFocus = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const restoreFocus = useCallback((previouslyFocusedElement: HTMLElement | null) => {
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  }, []);

  return { trapFocus, restoreFocus, announceMessage, focusElement };
}

// Skip link component for keyboard navigation
export function SkipLinks() {
  return (
    <div className="skip-links">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Skip to main content
      </a>
      <a 
        href="#navigation" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Skip to navigation
      </a>
    </div>
  );
}