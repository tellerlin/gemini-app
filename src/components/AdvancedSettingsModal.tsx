import React, { useState, useEffect } from 'react';
import { X, Settings, Brain, Sliders, Image } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import type { ConversationConfig, ThinkingConfig, GenerationConfig, ImageGenerationConfig } from '../types/chat';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationConfig: ConversationConfig;
  onSave: (config: ConversationConfig) => void;
  imageConfig: ImageGenerationConfig;
  onImageConfigSave: (config: ImageGenerationConfig) => void;
}

export function AdvancedSettingsModal({
  isOpen,
  onClose,
  conversationConfig,
  onSave,
  imageConfig,
  onImageConfigSave,
}: AdvancedSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'thinking' | 'generation' | 'image' | 'system'>('thinking');
  const [localConfig, setLocalConfig] = useState<ConversationConfig>(conversationConfig);
  const [localImageConfig, setLocalImageConfig] = useState<ImageGenerationConfig>(imageConfig);

  useEffect(() => {
    setLocalConfig(conversationConfig);
    setLocalImageConfig(imageConfig);
  }, [conversationConfig, imageConfig, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localConfig);
    onImageConfigSave(localImageConfig);
    onClose();
  };

  const updateThinkingConfig = (updates: Partial<ThinkingConfig>) => {
    setLocalConfig(prev => ({
      ...prev,
      thinkingConfig: {
        ...prev.thinkingConfig,
        enabled: prev.thinkingConfig?.enabled ?? true,
        budget: prev.thinkingConfig?.budget ?? 10000,
        showThinkingProcess: prev.thinkingConfig?.showThinkingProcess ?? false,
        ...updates,
      },
    }));
  };

  const updateGenerationConfig = (updates: Partial<GenerationConfig>) => {
    setLocalConfig(prev => ({
      ...prev,
      generationConfig: {
        ...prev.generationConfig,
        temperature: prev.generationConfig?.temperature ?? 0.7,
        topK: prev.generationConfig?.topK ?? 40,
        topP: prev.generationConfig?.topP ?? 0.95,
        maxOutputTokens: prev.generationConfig?.maxOutputTokens ?? 1000000,
        ...updates,
      },
    }));
  };

  const updateImageConfig = (updates: Partial<ImageGenerationConfig>) => {
    setLocalImageConfig(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const tabs = [
    { id: 'thinking' as const, label: '思考配置', icon: Brain },
    { id: 'generation' as const, label: '生成参数', icon: Sliders },
    { id: 'image' as const, label: '图片生成', icon: Image },
    { id: 'system' as const, label: '系统指令', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">高级设置</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex">
          {/* Tab Navigation */}
          <div className="w-48 border-r border-gray-200 bg-gray-50">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {activeTab === 'thinking' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">思考功能配置</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Gemini 2.5 模型支持思考功能，可以提高回答质量但会增加响应时间和token消耗。
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">启用思考功能</label>
                    <Button
                      variant={localConfig.thinkingConfig?.enabled ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => updateThinkingConfig({ enabled: !localConfig.thinkingConfig?.enabled })}
                    >
                      {localConfig.thinkingConfig?.enabled ? '已启用' : '已禁用'}
                    </Button>
                  </div>

                  {localConfig.thinkingConfig?.enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          思考预算 (Token数量)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="50000"
                          step="1000"
                          value={localConfig.thinkingConfig?.budget || 10000}
                          onChange={(e) => updateThinkingConfig({ budget: parseInt(e.target.value) || 10000 })}
                          placeholder="10000"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          设置为0可完全禁用思考功能。推荐值：10000-20000
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">显示思考过程</label>
                        <Button
                          variant={localConfig.thinkingConfig?.showThinkingProcess ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => updateThinkingConfig({ 
                            showThinkingProcess: !localConfig.thinkingConfig?.showThinkingProcess 
                          })}
                        >
                          {localConfig.thinkingConfig?.showThinkingProcess ? '显示' : '隐藏'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">快速预设</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateThinkingConfig({ enabled: false, budget: 0 })}
                    >
                      🚀 极速模式
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateThinkingConfig({ enabled: true, budget: 5000 })}
                    >
                      ⚡ 平衡模式
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateThinkingConfig({ enabled: true, budget: 15000 })}
                    >
                      🧠 深度思考
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateThinkingConfig({ enabled: true, budget: 30000 })}
                    >
                      🎯 专家模式
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'generation' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">生成参数配置</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    调整这些参数可以控制AI回答的创造性和一致性。
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      温度 (Temperature): {localConfig.generationConfig?.temperature || 0.7}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={localConfig.generationConfig?.temperature || 0.7}
                      onChange={(e) => updateGenerationConfig({ temperature: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      较低值更保守和一致，较高值更富创造性
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Top-K: {localConfig.generationConfig?.topK || 40}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={localConfig.generationConfig?.topK || 40}
                      onChange={(e) => updateGenerationConfig({ topK: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      考虑前K个最可能的词汇
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Top-P: {localConfig.generationConfig?.topP || 0.95}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={localConfig.generationConfig?.topP || 0.95}
                      onChange={(e) => updateGenerationConfig({ topP: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      核采样概率阈值
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最大输出Token数
                    </label>
                    <Select
                      value={localConfig.generationConfig?.maxOutputTokens?.toString() || '1000000'}
                      onChange={(value) => updateGenerationConfig({ maxOutputTokens: parseInt(value) })}
                      options={[
                        { value: '1024', label: '1,024 (短回答)' },
                        { value: '2048', label: '2,048 (中等回答)' },
                        { value: '4096', label: '4,096 (长回答)' },
                        { value: '8192', label: '8,192 (详细回答)' },
                        { value: '16384', label: '16,384 (超长回答)' },
                        { value: '32768', label: '32,768 (极长回答)' },
                        { value: '100000', label: '100,000 (无限制级别)' },
                        { value: '1000000', label: '1,000,000 (最大无限制)' },
                      ]}
                    />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">预设配置</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateGenerationConfig({ 
                        temperature: 0.3, topK: 20, topP: 0.8, maxOutputTokens: 4096 
                      })}
                    >
                      📚 精确模式
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateGenerationConfig({ 
                        temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1000000 
                      })}
                    >
                      ⚖️ 平衡模式
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateGenerationConfig({ 
                        temperature: 0.9, topK: 60, topP: 0.98, maxOutputTokens: 8192 
                      })}
                    >
                      🎨 创意模式
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateGenerationConfig({ 
                        temperature: 0.1, topK: 10, topP: 0.7, maxOutputTokens: 2048 
                      })}
                    >
                      🔒 保守模式
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'image' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">图片生成配置</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    配置Imagen模型的图片生成参数。
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      生成图片数量
                    </label>
                    <Select
                      value={localImageConfig.numberOfImages.toString()}
                      onChange={(value) => updateImageConfig({ numberOfImages: parseInt(value) })}
                      options={[
                        { value: '1', label: '1张图片' },
                        { value: '2', label: '2张图片' },
                        { value: '3', label: '3张图片' },
                        { value: '4', label: '4张图片' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      图片尺寸
                    </label>
                    <Select
                      value={localImageConfig.sampleImageSize}
                      onChange={(value) => updateImageConfig({ sampleImageSize: value as '1K' | '2K' })}
                      options={[
                        { value: '1K', label: '1K (1024x1024)' },
                        { value: '2K', label: '2K (2048x2048)' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      纵横比
                    </label>
                    <Select
                      value={localImageConfig.aspectRatio}
                      onChange={(value) => updateImageConfig({ aspectRatio: value as any })}
                      options={[
                        { value: '1:1', label: '1:1 (正方形)' },
                        { value: '3:4', label: '3:4 (竖屏)' },
                        { value: '4:3', label: '4:3 (横屏)' },
                        { value: '9:16', label: '9:16 (手机竖屏)' },
                        { value: '16:9', label: '16:9 (宽屏)' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      人物生成
                    </label>
                    <Select
                      value={localImageConfig.personGeneration}
                      onChange={(value) => updateImageConfig({ personGeneration: value as any })}
                      options={[
                        { value: 'dont_allow', label: '禁止生成人物' },
                        { value: 'allow_adult', label: '允许成人 (默认)' },
                        { value: 'allow_all', label: '允许所有人物' },
                      ]}
                    />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">快速预设</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateImageConfig({ 
                        numberOfImages: 1, sampleImageSize: '1K', aspectRatio: '1:1' 
                      })}
                    >
                      📱 社交媒体
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateImageConfig({ 
                        numberOfImages: 4, sampleImageSize: '2K', aspectRatio: '16:9' 
                      })}
                    >
                      🖥️ 桌面壁纸
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateImageConfig({ 
                        numberOfImages: 2, sampleImageSize: '1K', aspectRatio: '3:4' 
                      })}
                    >
                      📄 文档插图
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateImageConfig({ 
                        numberOfImages: 1, sampleImageSize: '2K', aspectRatio: '9:16' 
                      })}
                    >
                      📲 手机壁纸
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">系统指令</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    系统指令可以定义AI的角色和行为风格，将在每次对话开始时应用。
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自定义系统指令
                  </label>
                  <textarea
                    value={localConfig.systemInstruction || ''}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, systemInstruction: e.target.value }))}
                    placeholder="例如：你是一个专业的编程助手，擅长解释复杂的技术概念..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    留空将使用默认的通用助手指令
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-3">预设角色</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocalConfig(prev => ({ 
                        ...prev, 
                        systemInstruction: '你是一个专业的编程助手，擅长解释复杂的技术概念，提供代码示例，并帮助调试问题。请用清晰、结构化的方式回答，包含具体的代码示例。' 
                      }))}
                      className="text-left justify-start"
                    >
                      👨‍💻 编程助手
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocalConfig(prev => ({ 
                        ...prev, 
                        systemInstruction: '你是一个专业的写作助手，擅长帮助用户改进文章结构、语言表达和内容组织。请提供具体的修改建议和解释。' 
                      }))}
                      className="text-left justify-start"
                    >
                      ✍️ 写作助手
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocalConfig(prev => ({ 
                        ...prev, 
                        systemInstruction: '你是一个数据分析专家，擅长解读数据、创建图表和提供洞察。请用数据驱动的方式回答问题，并提供可视化建议。' 
                      }))}
                      className="text-left justify-start"
                    >
                      📊 数据分析师
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocalConfig(prev => ({ 
                        ...prev, 
                        systemInstruction: '你是一个耐心的教师，擅长用简单易懂的方式解释复杂概念。请一步步引导学习，提供练习建议。' 
                      }))}
                      className="text-left justify-start"
                    >
                      🎓 教师
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocalConfig(prev => ({ 
                        ...prev, 
                        systemInstruction: '你是一个创意助手，擅长头脑风暴、创意设计和内容创作。请提供多种创新想法和实现方案。' 
                      }))}
                      className="text-left justify-start"
                    >
                      💡 创意助手
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocalConfig(prev => ({ 
                        ...prev, 
                        systemInstruction: '' 
                      }))}
                      className="text-left justify-start"
                    >
                      🤖 默认助手
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存设置
          </Button>
        </div>
      </div>
    </div>
  );
}