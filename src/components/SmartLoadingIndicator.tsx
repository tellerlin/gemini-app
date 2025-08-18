import React, { useState, useEffect } from 'react';
import { Bot, Brain, Search, Image, Clock, Zap } from 'lucide-react';

interface SmartLoadingIndicatorProps {
  isLoading: boolean;
  isStreaming: boolean;
  currentStatus?: string;
  messageContent?: string;
  requestType?: 'text' | 'image' | 'analysis' | 'thinking';
  enableSmartIndicators?: boolean;
  enableRealtimeFeedback?: boolean;
}

interface LoadingPhase {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number;
  description?: string;
}

const getLoadingPhases = (requestType: string = 'text', messageContent: string = ''): LoadingPhase[] => {
  const content = messageContent.toLowerCase();
  
  // Detect request characteristics
  const isLongContent = messageContent.length > 500;
  const isCodeRequest = content.includes('code') || content.includes('function') || content.includes('programming');
  const isAnalysisRequest = content.includes('analyze') || content.includes('explain') || content.includes('why');
  const isCreativeRequest = content.includes('create') || content.includes('write') || content.includes('story');
  const isComplexQuery = isLongContent || isCodeRequest || isAnalysisRequest;
  
  if (requestType === 'image') {
    return [
      { id: 'processing', label: '处理请求', icon: Bot, duration: 1000, description: '分析图片生成需求' },
      { id: 'generating', label: '生成图片', icon: Image, duration: 8000, description: '使用 AI 模型创建图片' },
      { id: 'finalizing', label: '完成处理', icon: Zap, duration: 500, description: '优化和输出结果' },
    ];
  }
  
  if (requestType === 'thinking' || isComplexQuery) {
    return [
      { id: 'thinking', label: '深度思考', icon: Brain, duration: 2000, description: '分析问题复杂度' },
      { id: 'processing', label: '处理信息', icon: Bot, duration: 3000, description: '整理相关知识' },
      { id: 'generating', label: '组织回答', icon: Zap, duration: 2000, description: '构建完整回复' },
    ];
  }
  
  if (isAnalysisRequest) {
    return [
      { id: 'analyzing', label: '分析内容', icon: Search, duration: 2000, description: '深入理解问题' },
      { id: 'processing', label: '处理数据', icon: Bot, duration: 2000, description: '整合相关信息' },
      { id: 'generating', label: '生成回答', icon: Zap, duration: 1500, description: '组织分析结果' },
    ];
  }
  
  // Default for text requests
  const baseDuration = isLongContent ? 2000 : 1000;
  return [
    { id: 'processing', label: '理解问题', icon: Bot, duration: baseDuration, description: '分析您的请求' },
    { id: 'generating', label: '生成回答', icon: Zap, duration: baseDuration * 1.5, description: '构建回复内容' },
  ];
};

export function SmartLoadingIndicator({ 
  isLoading, 
  isStreaming,
  currentStatus,
  messageContent = '',
  requestType = 'text',
  enableSmartIndicators = true,
  enableRealtimeFeedback = true,
}: SmartLoadingIndicatorProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [phases, setPhases] = useState<LoadingPhase[]>([]);

  useEffect(() => {
    if (isLoading && enableSmartIndicators) {
      const loadingPhases = getLoadingPhases(requestType, messageContent);
      setPhases(loadingPhases);
      setCurrentPhase(0);
      setElapsedTime(0);
    }
  }, [isLoading, requestType, messageContent, enableSmartIndicators]);

  useEffect(() => {
    if (!isLoading || !enableSmartIndicators) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 100);
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading, enableSmartIndicators]);

  useEffect(() => {
    if (!isLoading || phases.length === 0) return;

    let totalDuration = 0;
    for (let i = 0; i <= currentPhase; i++) {
      totalDuration += phases[i]?.duration || 0;
    }

    if (elapsedTime >= totalDuration && currentPhase < phases.length - 1) {
      setCurrentPhase(prev => prev + 1);
    }
  }, [elapsedTime, currentPhase, phases, isLoading]);

  if (!isLoading) return null;

  // Simple mode - just basic loading dots
  if (!enableSmartIndicators) {
    return (
      <div className="flex justify-start">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl px-3 sm:px-4 py-3">
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Smart mode with phases and feedback
  const currentPhaseData = phases[currentPhase];
  if (!currentPhaseData) return null;

  const Icon = currentPhaseData.icon;
  const progress = Math.min(100, (elapsedTime / phases.reduce((sum, phase) => sum + phase.duration, 0)) * 100);

  return (
    <div className="flex justify-start">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Icon className="h-4 w-4 text-white animate-pulse" />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 min-w-[200px]">
          <div className="space-y-2">
            {/* Current phase indicator */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {currentStatus || currentPhaseData.label}
              </span>
              {enableRealtimeFeedback && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.floor(elapsedTime / 1000)}s
                </div>
              )}
            </div>
            
            {/* Phase description */}
            {enableRealtimeFeedback && currentPhaseData.description && (
              <p className="text-xs text-gray-500">
                {currentPhaseData.description}
              </p>
            )}
            
            {/* Progress bar */}
            {enableRealtimeFeedback && (
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            
            {/* Phase indicators */}
            {enableRealtimeFeedback && phases.length > 1 && (
              <div className="flex space-x-1">
                {phases.map((phase, index) => (
                  <div
                    key={phase.id}
                    className={`h-1 rounded-full flex-1 transition-colors duration-300 ${
                      index <= currentPhase
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}