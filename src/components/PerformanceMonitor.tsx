import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, CheckCircle, AlertCircle, BarChart3, RefreshCw, RotateCcw, Play, Trash2, AlertTriangle, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import type { PerformanceMetrics, KeyHealthStats } from '../types/chat';

interface KeyTestResult {
  keyIndex: number;
  masked: string;
  status: 'valid' | 'temporarily_invalid' | 'permanently_invalid';
  attempts: number;
  errors: string[];
  averageResponseTime?: number;
  lastSuccessful?: boolean;
}

interface PerformanceMonitorProps {
  isOpen: boolean;
  onClose: () => void;
  getMetrics: () => PerformanceMetrics | null;
  onResetMetrics?: () => void;
  selectedModel?: string;
  testApiKeys?: () => Promise<{
    totalKeys: number;
    validKeys: number;
    temporarilyInvalidKeys: number;
    permanentlyInvalidKeys: number;
    results: KeyTestResult[];
  }>;
  removeInvalidKeys?: (type: 'permanent_only' | 'temporary_only' | 'all_invalid') => Promise<{
    removedKeys: Array<{masked: string; reason: string; status: string}>;
    remainingKeys: number;
    removedCount: {permanent: number; temporary: number; total: number};
  }>;
}

export function PerformanceMonitor({ isOpen, onClose, getMetrics, onResetMetrics, selectedModel, testApiKeys, removeInvalidKeys }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isTestingKeys, setIsTestingKeys] = useState(false);
  const [testResults, setTestResults] = useState<KeyTestResult[] | null>(null);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [resetOnStartup, setResetOnStartup] = useState(() => {
    return localStorage.getItem('performance-monitor-reset-on-startup') === 'true';
  });

  const refreshMetrics = useCallback(() => {
    try {
      const currentMetrics = getMetrics();
      setMetrics(currentMetrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }, [getMetrics]);

  const handleResetMetrics = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all performance statistics? This will clear all counters and start fresh statistics collection.')) {
      onResetMetrics?.();
      refreshMetrics(); // Refresh to show the reset values
    }
  }, [onResetMetrics, refreshMetrics]);

  const handleTestApiKeys = useCallback(async () => {
    if (!testApiKeys) return;
    
    setIsTestingKeys(true);
    try {
      console.log(`🔍 Testing API keys with model: ${selectedModel || 'gemini-2.5-flash'}`);
      const results = await testApiKeys();
      setTestResults(results.results);
      setLastTestTime(new Date());
      console.log(`✅ Key testing completed: ${results.validKeys} valid, ${results.temporarilyInvalidKeys} temporary issues, ${results.permanentlyInvalidKeys} permanent issues`);
    } catch (error) {
      console.error('❌ Failed to test API keys:', error);
      alert('Failed to test API keys: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsTestingKeys(false);
    }
  }, [testApiKeys, selectedModel]);

  const handleRemoveKeys = useCallback(async (removeType: 'permanent_only' | 'temporary_only' | 'all_invalid') => {
    if (!removeInvalidKeys || !testResults) return;
    
    const typeDescription = {
      'permanent_only': 'permanently invalid keys',
      'temporary_only': 'temporarily invalid keys', 
      'all_invalid': 'all invalid keys'
    };
    
    const confirmed = window.confirm(`Are you sure you want to remove ${typeDescription[removeType]}? This action cannot be undone.`);
    if (!confirmed) return;
    
    setIsRemoving(true);
    try {
      const result = await removeInvalidKeys(removeType);
      console.log(`🗑️ Removed ${result.removedCount.total} keys`);
      alert(`Successfully removed ${result.removedCount.total} keys (${result.removedCount.permanent} permanent, ${result.removedCount.temporary} temporary). ${result.remainingKeys} keys remaining.`);
      
      // Refresh test results and metrics
      setTestResults(null);
      refreshMetrics();
    } catch (error) {
      console.error('❌ Failed to remove keys:', error);
      alert('Failed to remove keys: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsRemoving(false);
    }
  }, [removeInvalidKeys, testResults, refreshMetrics]);

  const handleResetOnStartupChange = useCallback((checked: boolean) => {
    setResetOnStartup(checked);
    localStorage.setItem('performance-monitor-reset-on-startup', checked.toString());
  }, []);

  // Effect to handle reset on startup
  useEffect(() => {
    if (resetOnStartup && onResetMetrics) {
      // Check if this is app startup (we use a session storage flag)
      const hasResetThisSession = sessionStorage.getItem('performance-reset-done');
      if (!hasResetThisSession) {
        onResetMetrics();
        sessionStorage.setItem('performance-reset-done', 'true');
        console.log('📊 Performance metrics reset on app startup');
      }
    }
  }, [resetOnStartup, onResetMetrics]);

  useEffect(() => {
    if (isOpen) {
      // Initial load
      refreshMetrics();
      
      // Auto refresh every 5 seconds
      if (autoRefresh) {
        const interval = setInterval(() => {
          refreshMetrics();
        }, 5000);
        setRefreshInterval(interval);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    };
  }, [isOpen, autoRefresh, refreshMetrics]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getHealthColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-green-600' : 'text-red-600';
  };

  const getHealthIcon = (isHealthy: boolean) => {
    return isHealthy ? CheckCircle : AlertCircle;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600';
      case 'temporarily_invalid': return 'text-yellow-600';
      case 'permanently_invalid': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return CheckCircle;
      case 'temporarily_invalid': return AlertTriangle;
      case 'permanently_invalid': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid': return 'Valid';
      case 'temporarily_invalid': return 'Temporary Issue';
      case 'permanently_invalid': return 'Permanently Invalid';
      default: return 'Unknown';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Performance Monitor</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'text-green-600' : 'text-gray-500'}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={refreshMetrics}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Manual Refresh
            </Button>
            {testApiKeys && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleTestApiKeys}
                disabled={isTestingKeys}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {isTestingKeys ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                {isTestingKeys ? 'Testing...' : 'Test Keys'}
              </Button>
            )}
            {onResetMetrics && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetMetrics}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset Stats
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {metrics ? (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Requests</p>
                      <p className="text-2xl font-bold text-blue-900">{metrics.totalRequests}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Success Rate</p>
                      <p className="text-2xl font-bold text-green-900">{metrics.successRate}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Total Errors</p>
                      <p className="text-2xl font-bold text-yellow-900">{metrics.totalErrors}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Uptime</p>
                      <p className="text-2xl font-bold text-purple-900">{formatUptime(metrics.uptime)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* API Key Testing Section */}
              {testApiKeys && (
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">API Key Testing</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {selectedModel && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          Model: {selectedModel}
                        </span>
                      )}
                      {lastTestTime && (
                        <span>Last tested: {lastTestTime.toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>
                  
                  {testResults && testResults.length > 0 ? (
                    <>
                      <div className="space-y-3 mb-4">
                        {testResults.map((result, index) => {
                          const StatusIcon = getStatusIcon(result.status);
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <StatusIcon className={`h-5 w-5 ${getStatusColor(result.status)}`} />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">{result.masked}</p>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      result.status === 'valid' ? 'bg-green-100 text-green-800' :
                                      result.status === 'temporarily_invalid' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {getStatusText(result.status)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    Attempts: {result.attempts}
                                    {result.averageResponseTime && ` | Avg Response: ${result.averageResponseTime.toFixed(0)}ms`}
                                  </p>
                                  {result.errors.length > 0 && (
                                    <p className="text-sm text-red-600 mt-1">
                                      Error: {result.errors[result.errors.length - 1]}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Clean-up Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveKeys('permanent_only')}
                          disabled={isRemoving || !testResults.some(r => r.status === 'permanently_invalid')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove Permanent Errors
                          {testResults.filter(r => r.status === 'permanently_invalid').length > 0 && (
                            <span className="ml-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {testResults.filter(r => r.status === 'permanently_invalid').length}
                            </span>
                          )}
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveKeys('all_invalid')}
                          disabled={isRemoving || !testResults.some(r => r.status !== 'valid')}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Remove All Invalid
                          {testResults.filter(r => r.status !== 'valid').length > 0 && (
                            <span className="ml-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              {testResults.filter(r => r.status !== 'valid').length}
                            </span>
                          )}
                        </Button>
                        
                        {isRemoving && (
                          <span className="flex items-center text-sm text-gray-600">
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            Removing keys...
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Play className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Click "Test Keys" to check the availability of your API keys</p>
                      <p className="text-sm mt-1">
                        Test will use model: <strong>{selectedModel || 'gemini-2.5-flash'}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* API Keys Health */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">API Key Health Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Key: {metrics.currentKeyIndex}/{metrics.totalKeys}</span>
                    <span className="text-gray-600">Healthy Keys: {metrics.healthyKeys}/{metrics.totalKeys}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {metrics.keyStats && metrics.keyStats.map((keyStats: KeyHealthStats, index: number) => {
                      const HealthIcon = getHealthIcon(keyStats.isHealthy);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <HealthIcon className={`h-5 w-5 ${getHealthColor(keyStats.isHealthy)}`} />
                            <div>
                              <p className="font-medium text-gray-900">API Key {keyStats.keyIndex}</p>
                              <p className="text-sm text-gray-500">
                                Success Rate: {keyStats.successRate}% | Consecutive Errors: {keyStats.consecutiveErrors}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {keyStats.successCount} Success / {keyStats.errorCount} Errors
                            </p>
                            <p className="text-xs text-gray-500">
                              Last Used: {new Date(keyStats.lastUsed).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {metrics.keyStats && metrics.keyStats.some((k: KeyHealthStats) => k.lastError) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">Recent Errors</h3>
                  <div className="space-y-2">
                    {metrics.keyStats
                      .filter((k: KeyHealthStats) => k.lastError)
                      .map((keyStats: KeyHealthStats, index: number) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-red-800">API Key {keyStats.keyIndex}:</span>
                          <span className="text-red-700 ml-2">{keyStats.lastError}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Performance Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Performance Suggestions</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  {metrics.successRate && parseFloat(metrics.successRate) < 90 && (
                    <p>• Low success rate, suggest checking API key validity</p>
                  )}
                  {metrics.healthyKeys < metrics.totalKeys && (
                    <p>• Unhealthy API keys detected, suggest replacement or inspection</p>
                  )}
                  {metrics.totalErrors > 10 && (
                    <p>• High error count, suggest checking network connection and key quotas</p>
                  )}
                  {metrics.healthyKeys === metrics.totalKeys && parseFloat(metrics.successRate) > 95 && (
                    <p>• All metrics normal, system running well!</p>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="bg-gray-50 border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Reset stats on app startup</p>
                      <p className="text-sm text-gray-500">
                        Automatically clear all performance statistics when the application starts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={resetOnStartup}
                        onChange={(e) => handleResetOnStartupChange(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <details className="cursor-pointer">
                  <summary className="font-medium text-gray-900 mb-2">Technical Details</summary>
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(metrics, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading performance data...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}