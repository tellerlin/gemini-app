import React, { useState } from 'react';

interface ProxyTestResult {
  url: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  responseTime?: number;
  error?: string;
  timestamp: Date;
}

export const ProxyTester: React.FC = () => {
  const [testResults, setTestResults] = useState<ProxyTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testUrls = [
    'https://geminiproxyworker.xuexiao.eu.org/v1beta/models',
    `${window.location.origin}/api/gemini/v1beta/models`,
    'https://generativelanguage.googleapis.com/v1beta/models' // Direct API (should fail from browser)
  ];

  const runProxyTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    for (const url of testUrls) {
      const testResult: ProxyTestResult = {
        url,
        status: 'pending',
        timestamp: new Date()
      };
      
      setTestResults(prev => [...prev, testResult]);

      const startTime = performance.now();
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        const endTime = performance.now();
        
        setTestResults(prev => prev.map(result => 
          result.url === url ? {
            ...result,
            status: response.ok ? 'success' : 'error',
            statusCode: response.status,
            responseTime: endTime - startTime,
            error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
          } : result
        ));

      } catch (error) {
        const endTime = performance.now();
        
        setTestResults(prev => prev.map(result => 
          result.url === url ? {
            ...result,
            status: 'error',
            responseTime: endTime - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          } : result
        ));
      }
    }

    setIsRunning(false);
  };

  const getStatusEmoji = (status: ProxyTestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: ProxyTestResult['status']) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '60px',
      right: '10px',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '15px',
      minWidth: '300px',
      maxWidth: '500px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px' 
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#333' }}>🔧 Proxy Connectivity Test</h3>
        <button
          onClick={runProxyTests}
          disabled={isRunning}
          style={{
            background: isRunning ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '11px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '12px' }}>Test Results:</h4>
          {testResults.map((result, index) => (
            <div key={index} style={{ 
              marginBottom: '10px', 
              padding: '8px',
              background: '#f9f9f9',
              borderRadius: '4px',
              border: `1px solid ${getStatusColor(result.status)}20`
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '4px' 
              }}>
                <span style={{ marginRight: '8px' }}>
                  {getStatusEmoji(result.status)}
                </span>
                <span style={{ 
                  color: getStatusColor(result.status),
                  fontWeight: 'bold',
                  fontSize: '10px'
                }}>
                  {result.status.toUpperCase()}
                </span>
                {result.statusCode && (
                  <span style={{ 
                    marginLeft: '8px',
                    color: '#666',
                    fontSize: '10px'
                  }}>
                    {result.statusCode}
                  </span>
                )}
                {result.responseTime && (
                  <span style={{ 
                    marginLeft: '8px',
                    color: '#666',
                    fontSize: '10px'
                  }}>
                    {Math.round(result.responseTime)}ms
                  </span>
                )}
              </div>
              <div style={{ 
                color: '#333',
                fontSize: '10px',
                wordBreak: 'break-all',
                marginBottom: result.error ? '4px' : '0'
              }}>
                {result.url}
              </div>
              {result.error && (
                <div style={{ 
                  color: '#F44336',
                  fontSize: '10px',
                  fontStyle: 'italic'
                }}>
                  {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        fontSize: '9px', 
        color: '#999', 
        borderTop: '1px solid #eee', 
        paddingTop: '8px',
        marginTop: '10px' 
      }}>
        Tests proxy endpoints to verify routing configuration
      </div>
    </div>
  );
};

export default ProxyTester;