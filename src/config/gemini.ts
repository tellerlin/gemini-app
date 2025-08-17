export const GEMINI_MODELS: Array<{
  id: string;
  name: string;
  description: string;
  supportsVision: boolean;
  maxTokens: number;
  supportsAudio?: boolean;
  supportsVideo?: boolean;
  supportsPdf?: boolean;
  supportsLive?: boolean;
  supportsThinking?: boolean;
  supportsGrounding?: boolean;
  supportsUrlContext?: boolean;
  costTier?: 'free' | 'low' | 'medium' | 'high';
}> = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (GA)',
    description: 'Enhanced thinking and reasoning, multimodal understanding, advanced coding, and more - now in General Availability with thinking capability',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsPdf: true,
    supportsThinking: true,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 2000000, // Updated context window for 2025
    costTier: 'high',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (GA)',
    description: 'Adaptive thinking with cost efficiency - General Availability version with thinking budgets',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsThinking: true,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 1000000, // Updated context window for 2025
    costTier: 'medium',
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    description: 'Most cost-efficient model supporting high throughput and faster processing',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsThinking: true,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 8192,
    costTier: 'low',
  },
  {
    id: 'gemini-2.5-flash-live',
    name: 'Gemini 2.5 Flash Live',
    description: 'Low-latency bidirectional voice and video interactions with real-time processing',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsLive: true,
    supportsThinking: true,
    maxTokens: 8192,
    costTier: 'high',
  },
];

export const DEFAULT_MODEL = 'gemini-2.5-flash';

// Model capability helper
export const getModelCapabilities = (modelId: string) => {
  const model = GEMINI_MODELS.find(m => m.id === modelId);
  if (!model) {
    return {
      supportsThinking: false,
      supportsGrounding: false,
      supportsUrlContext: false,
      supportsImageGeneration: false,
      maxContextTokens: 32768,
    };
  }
  
  return {
    supportsThinking: model.supportsThinking || false,
    supportsGrounding: model.supportsGrounding || false,
    supportsUrlContext: model.supportsUrlContext || false,
    maxContextTokens: model.maxTokens || 32768,
  };
};

// Smart thinking configuration based on task type
export const getOptimalThinkingConfig = (messageContent: string, model: string) => {
  const capabilities = getModelCapabilities(model);
  
  if (!capabilities.supportsThinking) {
    return { enabled: false, budget: 0 };
  }

  // Analyze message content to determine optimal thinking budget
  const content = messageContent.toLowerCase();
  
  // Complex reasoning tasks - high thinking budget
  if (
    content.includes('analyze') ||
    content.includes('explain') ||
    content.includes('reasoning') ||
    content.includes('logic') ||
    content.includes('problem') ||
    content.includes('solution') ||
    content.includes('compare') ||
    content.includes('evaluate') ||
    content.includes('pros and cons') ||
    content.includes('advantages') ||
    content.includes('disadvantages')
  ) {
    return { enabled: true, budget: 50000 }; // High thinking for complex reasoning
  }
  
  // Coding/technical tasks - medium thinking budget
  if (
    content.includes('code') ||
    content.includes('program') ||
    content.includes('function') ||
    content.includes('algorithm') ||
    content.includes('debug') ||
    content.includes('implement') ||
    content.includes('technical') ||
    content.includes('architecture') ||
    content.includes('design pattern')
  ) {
    return { enabled: true, budget: 30000 }; // Medium thinking for coding
  }
  
  // Math/calculation tasks - medium thinking budget
  if (
    content.includes('calculate') ||
    content.includes('math') ||
    content.includes('equation') ||
    content.includes('formula') ||
    content.includes('solve') ||
    content.includes('computation')
  ) {
    return { enabled: true, budget: 25000 }; // Medium thinking for math
  }
  
  // Creative tasks - low thinking budget
  if (
    content.includes('write') ||
    content.includes('story') ||
    content.includes('poem') ||
    content.includes('creative') ||
    content.includes('imagine') ||
    content.includes('describe')
  ) {
    return { enabled: true, budget: 10000 }; // Low thinking for creativity
  }
  
  // Simple questions - minimal thinking
  if (
    content.includes('what is') ||
    content.includes('who is') ||
    content.includes('when is') ||
    content.includes('where is') ||
    content.includes('define') ||
    content.includes('meaning')
  ) {
    return { enabled: true, budget: 5000 }; // Minimal thinking for simple questions
  }
  
  // Quick requests - no thinking for speed
  if (
    content.includes('quick') ||
    content.includes('fast') ||
    content.includes('brief') ||
    content.includes('summary') ||
    content.length < 50
  ) {
    return { enabled: false, budget: 0 }; // No thinking for speed
  }
  
  // Default: moderate thinking
  return { enabled: true, budget: 15000 };
};

