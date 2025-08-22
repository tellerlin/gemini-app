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
  supportsImageGeneration?: boolean;
  costTier?: 'free' | 'low' | 'medium' | 'high';
  inputPricing?: {
    perMillion: number;
    cachingPerMillion?: number;
  };
  outputPricing?: {
    perMillion: number;
    thinkingPerMillion?: number;
  };
}> = [
  {
    id: 'gemini-2.5-pro-preview-06-05',
    name: 'Gemini 2.5 Pro Preview',
    description: 'Latest Gemini 2.5 Pro with enhanced reasoning, coding, and multimodal capabilities',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsPdf: true,
    supportsThinking: true,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 1048576, // 1M input, 65K output
    costTier: 'high',
    inputPricing: {
      perMillion: 1.25, // ≤200k tokens
      cachingPerMillion: 0.31
    },
    outputPricing: {
      perMillion: 10.00,
      thinkingPerMillion: 10.00 // Included in output pricing
    }
  },
  {
    id: 'gemini-2.5-flash-preview-05-20',
    name: 'Gemini 2.5 Flash Preview',
    description: 'Fast and cost-effective with adaptive thinking capabilities',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsPdf: true,
    supportsThinking: true,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 1048576, // 1M input, 65K output
    costTier: 'medium',
    inputPricing: {
      perMillion: 0.15, // text/image/video
      cachingPerMillion: 0.0375
    },
    outputPricing: {
      perMillion: 0.60, // non-thinking
      thinkingPerMillion: 3.50 // thinking tokens
    }
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Next-generation features with multimodal capabilities',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsPdf: true,
    supportsThinking: true,
    supportsGrounding: true,
    supportsUrlContext: true,
    supportsImageGeneration: false,
    maxTokens: 1000000,
    costTier: 'medium',
  },
  {
    id: 'gemini-2.0-flash-live-001',
    name: 'Gemini 2.0 Flash Live',
    description: 'Optimized for low-latency bidirectional voice and video interactions',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsLive: true,
    supportsThinking: false,
    supportsGrounding: false,
    supportsUrlContext: false,
    maxTokens: 1000000,
    costTier: 'medium',
  },
  {
    id: 'gemini-2.0-flash-preview-image-generation',
    name: 'Gemini 2.0 Flash Image Generation',
    description: 'Specialized for conversational image generation and editing',
    supportsVision: true,
    supportsImageGeneration: true,
    supportsThinking: false,
    supportsGrounding: false,
    supportsUrlContext: false,
    maxTokens: 1000000,
    costTier: 'high',
  },
  {
    id: 'gemini-embedding-exp-03-07',
    name: 'Gemini Embedding Experimental',
    description: 'State-of-the-art text embeddings for semantic understanding',
    supportsVision: false,
    supportsThinking: false,
    supportsGrounding: false,
    supportsUrlContext: false,
    maxTokens: 2048,
    costTier: 'low',
  },
  // Legacy models (maintaining backward compatibility)
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (Legacy)',
    description: 'Legacy version - use gemini-2.5-pro-preview-06-05 instead',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsPdf: true,
    supportsThinking: true,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 2000000,
    costTier: 'high',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Legacy)',
    description: 'Legacy version - use gemini-2.5-flash-preview-05-20 instead',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsThinking: true,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 1000000,
    costTier: 'medium',
  },
];

export const DEFAULT_MODEL = 'gemini-2.5-flash-preview-05-20';

// Model fallback chain for intelligent switching when quota is exhausted
// Updated with latest 2025 model hierarchy
export const MODEL_FALLBACK_CHAINS: Record<string, string[]> = {
  'gemini-2.5-pro-preview-06-05': [
    'gemini-2.5-flash-preview-05-20', // Same generation, faster and cheaper
    'gemini-2.0-flash', // Fallback to stable 2.0
    'gemini-2.5-pro', // Legacy pro version
  ],
  'gemini-2.5-flash-preview-05-20': [
    'gemini-2.0-flash', // Stable alternative
    'gemini-2.5-flash', // Legacy flash version
    'gemini-2.5-pro-preview-06-05', // Upgrade to pro if needed
  ],
  'gemini-2.0-flash': [
    'gemini-2.5-flash-preview-05-20', // Upgrade to latest flash
    'gemini-2.5-flash', // Legacy flash alternative
    'gemini-2.5-pro-preview-06-05', // Premium alternative
  ],
  'gemini-2.0-flash-live-001': [
    'gemini-2.0-flash', // Similar generation without live features
    'gemini-2.5-flash-preview-05-20', // Latest general purpose model
  ],
  // Legacy model fallbacks
  'gemini-2.5-pro': [
    'gemini-2.5-pro-preview-06-05', // Upgrade to latest
    'gemini-2.5-flash-preview-05-20', // Step down to flash
    'gemini-2.0-flash', // Stable alternative
  ],
  'gemini-2.5-flash': [
    'gemini-2.5-flash-preview-05-20', // Upgrade to latest
    'gemini-2.0-flash', // Alternative option
    'gemini-2.5-pro-preview-06-05', // Upgrade if needed
  ],
};

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

// Get the next best model when current model fails
export const getNextBestModel = (currentModel: string): string | null => {
  const fallbackChain = MODEL_FALLBACK_CHAINS[currentModel];
  if (!fallbackChain || fallbackChain.length === 0) {
    return null;
  }
  return fallbackChain[0]; // Return the best alternative
};

// Get user-friendly explanation for model switch
export const getModelSwitchExplanation = (fromModel: string, toModel: string): string => {
  const fromModelInfo = GEMINI_MODELS.find(m => m.id === fromModel);
  const toModelInfo = GEMINI_MODELS.find(m => m.id === toModel);
  
  if (!fromModelInfo || !toModelInfo) {
    return `Switched from ${fromModel} to ${toModel} due to quota exhaustion.`;
  }
  
  const fromTier = fromModelInfo.costTier || 'medium';
  const toTier = toModelInfo.costTier || 'medium';
  
  if (fromTier === 'high' && toTier === 'medium') {
    return `Switched from ${fromModelInfo.name} to ${toModelInfo.name}.`;
  } else if (fromTier === 'medium' && toTier === 'low') {
    return `Switched from ${fromModelInfo.name} to ${toModelInfo.name}.`;
  } else if (fromTier === 'low' && toTier === 'medium') {
    return `Upgraded from ${fromModelInfo.name} to ${toModelInfo.name} for better performance and capabilities.`;
  } else if (fromTier === 'medium' && toTier === 'high') {
    return `Upgraded to ${toModelInfo.name} for premium quality and advanced capabilities.`;
  } else {
    return `Switched to ${toModelInfo.name} for optimal performance.`;
  }
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

