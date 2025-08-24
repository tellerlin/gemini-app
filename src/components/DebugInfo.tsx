import React, { useState, useEffect } from 'react';

interface DebugData {
  hostname: string;
  origin: string;
  userAgent: string;
  environmentVars: Record<string, string | undefined>;
  networkInfo?: any;
  fallbackUrl?: string;
  timestamp: string;
}

export const DebugInfo: React.FC = () => {
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Collect debug information
    const collectDebugData = () => {
      const env = import.meta.env;
      const data: DebugData = {
        hostname: window.location.hostname,
        origin: window.location.origin,
        userAgent: navigator.userAgent.substring(0, 200) + '...',
        environmentVars: {
          VITE_GEMINI_API_MODE: env.VITE_GEMINI_API_MODE,
          VITE_GEMINI_PROXY_URL: env.VITE_GEMINI_PROXY_URL,
          NODE_ENV: env.NODE_ENV,
          MODE: env.MODE,
          PROD: env.PROD?.toString(),
          DEV: env.DEV?.toString(),
        },
        fallbackUrl: (window as any).__FALLBACK_PROXY_URL,
        timestamp: new Date().toISOString()
      };

      // Add network info if available
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        data.networkInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }

      setDebugData(data);
    };

    collectDebugData();
    
    // Also add to console for easier debugging
    console.log('🔍 Debug Info Component Loaded');
    console.table({
      'Window Location': window.location.href,
      'Hostname': window.location.hostname,
      'Origin': window.location.origin,
      'VITE_GEMINI_API_MODE': import.meta.env.VITE_GEMINI_API_MODE || 'undefined',
      'VITE_GEMINI_PROXY_URL': import.meta.env.VITE_GEMINI_PROXY_URL || 'undefined',
      'All VITE vars': Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')).join(', '),
    });
  }, []);

  // Enable debug mode with Ctrl+Shift+D or Cmd+Shift+D
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        setIsVisible(!isVisible);
        console.log('🔍 Debug panel toggled:', !isVisible);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isVisible]);

  if (!isVisible || !debugData) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.1)',
          color: '#666',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'monospace',
          zIndex: 1000,
          cursor: 'pointer'
        }}
        onClick={() => setIsVisible(true)}
        title="Click or press Ctrl+Shift+D to show debug info"
      >
        Debug
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 10000,
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '2px solid #333'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#4CAF50' }}>🔍 Debug Info</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#FFA726' }}>🌐 Location Info</h4>
        <div>Hostname: <span style={{ color: '#81C784' }}>{debugData.hostname}</span></div>
        <div>Origin: <span style={{ color: '#81C784' }}>{debugData.origin}</span></div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#FFA726' }}>⚙️ Environment Variables</h4>
        {Object.entries(debugData.environmentVars).map(([key, value]) => (
          <div key={key} style={{ marginLeft: '10px' }}>
            {key}: <span style={{ color: value ? '#81C784' : '#F48FB1' }}>
              {value || 'undefined'}
            </span>
          </div>
        ))}
      </div>

      {debugData.fallbackUrl && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#FFA726' }}>🔗 Fallback URL</h4>
          <div style={{ color: '#81C784' }}>{debugData.fallbackUrl}</div>
        </div>
      )}

      {debugData.networkInfo && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#FFA726' }}>📡 Network Info</h4>
          {Object.entries(debugData.networkInfo).map(([key, value]) => (
            <div key={key} style={{ marginLeft: '10px' }}>
              {key}: <span style={{ color: '#81C784' }}>{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#FFA726' }}>🕐 Timestamp</h4>
        <div style={{ color: '#81C784', fontSize: '10px' }}>{debugData.timestamp}</div>
      </div>

      <div style={{ fontSize: '10px', color: '#999', borderTop: '1px solid #333', paddingTop: '10px' }}>
        Press Ctrl+Shift+D to toggle this panel
      </div>
    </div>
  );
};

export default DebugInfo;