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
  // Gemini 2.5 Series - Latest with most advanced features
  {
    id: 'gemini-2.5-pro-preview-06-05',
    name: 'Gemini 2.5 Pro Preview',
    description: 'Latest Gemini 2.5 Pro with enhanced reasoning and thinking capabilities',
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
      perMillion: 1.25,
      cachingPerMillion: 0.31
    },
    outputPricing: {
      perMillion: 10.00,
      thinkingPerMillion: 10.00
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
    maxTokens: 1048576,
    costTier: 'medium',
    inputPricing: {
      perMillion: 0.15,
      cachingPerMillion: 0.0375
    },
    outputPricing: {
      perMillion: 0.60,
      thinkingPerMillion: 3.50
    }
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Stable)',
    description: 'Stable version of Gemini 2.5 Flash with thinking capabilities',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsPdf: true,
    supportsThinking: true,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 1048576,
    costTier: 'medium',
    inputPricing: {
      perMillion: 0.15,
      cachingPerMillion: 0.0375
    },
    outputPricing: {
      perMillion: 0.60,
      thinkingPerMillion: 3.50
    }
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (Stable)',
    description: 'Stable release of Gemini 2.5 Pro with thinking capabilities',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsPdf: true,
    supportsThinking: true,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 1048576,
    costTier: 'high',
    inputPricing: {
      perMillion: 1.25,
      cachingPerMillion: 0.31
    },
    outputPricing: {
      perMillion: 10.00,
      thinkingPerMillion: 10.00
    }
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite (Stable)',
    description: 'Cost-effective version of Gemini 2.5 Flash',
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsPdf: true,
    supportsThinking: true,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 1048576,
    costTier: 'low',
    inputPricing: {
      perMillion: 0.075,
      cachingPerMillion: 0.01875
    },
    outputPricing: {
      perMillion: 0.30,
      thinkingPerMillion: 1.75
    }
  },

  // Gemini 2.0 Series - Mature and stable versions
  {
    id: 'gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash (GA)',
    description: 'Generally available stable version of Gemini 2.0 Flash',
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsPdf: true,
    supportsThinking: false,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 1048576,
    costTier: 'medium',
    inputPricing: {
      perMillion: 0.15,
      cachingPerMillion: 0.0375
    },
    outputPricing: {
      perMillion: 0.60
    }
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Gemini 2.0 Flash with multimodal capabilities',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsPdf: true,
    supportsThinking: false,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 1048576,
    costTier: 'medium',
    inputPricing: {
      perMillion: 0.15,
      cachingPerMillion: 0.0375
    },
    outputPricing: {
      perMillion: 0.60
    }
  },
  {
    id: 'gemini-2.0-flash-lite-001',
    name: 'Gemini 2.0 Flash-Lite (GA)',
    description: 'Stable cost-effective version of Gemini 2.0',
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsPdf: true,
    supportsThinking: false,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 1048576,
    costTier: 'low',
    inputPricing: {
      perMillion: 0.075,
      cachingPerMillion: 0.01875
    },
    outputPricing: {
      perMillion: 0.30
    }
  },

];

export const DEFAULT_MODEL = 'gemini-2.5-flash'; // Use stable GA model instead of preview

// Intelligent model fallback chains based on actual availability and performance
export const MODEL_FALLBACK_CHAINS: Record<string, string[]> = {
  // Primary model fallbacks - Updated to prefer stable models
  'gemini-2.5-pro': [
    'gemini-2.5-flash', // Stable flash version
    'gemini-2.0-flash-001', // GA version
    'gemini-2.5-flash-lite', // Cost-effective option
  ],
  'gemini-2.5-flash': [
    'gemini-2.0-flash-001', // Downgrade to stable 2.0
    'gemini-2.5-flash-lite', // Lite version
    'gemini-2.0-flash-lite-001', // Stable lite version
  ],
  'gemini-2.5-flash-lite': [
    'gemini-2.5-flash', // Upgrade to full version
    'gemini-2.0-flash-lite-001', // Same tier 2.0 version
    'gemini-2.0-flash-001', // Stable 2.0 backup
  ],
  
  // 2.0 Series fallbacks
  'gemini-2.0-flash-001': [
    'gemini-2.0-flash', // Preview version
    'gemini-2.5-flash-preview-05-20', // Upgrade to 2.5
    'gemini-2.0-flash-lite-001', // Downgrade to 2.0 lite
  ],
  'gemini-2.0-flash': [
    'gemini-2.0-flash-001', // GA version
    'gemini-2.5-flash-preview-05-20', // Upgrade to 2.5
    'gemini-2.0-flash-lite-001', // Downgrade backup
  ],
  'gemini-2.0-flash-lite-001': [
    'gemini-2.0-flash-001', // Upgrade to full version
    'gemini-2.5-flash-lite', // Upgrade to 2.5 lite
    'gemini-2.0-flash-001', // Final backup
  ]
};

// Model recommendations based on different use cases
export const RECOMMENDED_MODELS = {
  // Performance priority (cost no object)
  performance: [
    'gemini-2.5-pro-preview-06-05',
    'gemini-2.5-pro',
    'gemini-2.5-flash-preview-05-20'
  ],
  
  // Balanced performance and cost - Updated to stable models
  balanced: [
    'gemini-2.5-flash',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite-001'
  ],
  
  // Cost priority
  costEffective: [
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite-001'
  ],
  
  // Stability priority (GA versions only)
  stable: [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash-001'
  ],
  
  // Thinking capability priority
  thinking: [
    'gemini-2.5-pro-preview-06-05',
    'gemini-2.5-flash-preview-05-20',
    'gemini-2.5-pro',
    'gemini-2.5-flash'
  ]
};

// Model capability quick lookups
export const MODEL_CAPABILITIES = {
  // Models supporting thinking
  withThinking: GEMINI_MODELS
    .filter(m => m.supportsThinking)
    .map(m => m.id),
    
  // Models supporting vision
  withVision: GEMINI_MODELS
    .filter(m => m.supportsVision)
    .map(m => m.id),
    
  // Models supporting audio
  withAudio: GEMINI_MODELS
    .filter(m => m.supportsAudio)
    .map(m => m.id),
    
  // Cost-effective models
  costEffective: GEMINI_MODELS
    .filter(m => m.costTier === 'low')
    .map(m => m.id),
    
  // Large context models (>1M tokens)
  largeContext: GEMINI_MODELS
    .filter(m => m.maxTokens >= 1000000)
    .map(m => m.id)
};

// Utility functions for model switching logic
export function getNextBestModel(currentModel: string): string | null {
  const fallbackChain = MODEL_FALLBACK_CHAINS[currentModel];
  if (!fallbackChain || fallbackChain.length === 0) {
    // If no specific fallback chain, return the default model
    return currentModel !== DEFAULT_MODEL ? DEFAULT_MODEL : null;
  }
  
  // Return the first model in the fallback chain
  return fallbackChain[0];
}

export function getModelSwitchExplanation(fromModel: string, toModel: string): string {
  const fromModelInfo = GEMINI_MODELS.find(m => m.id === fromModel);
  const toModelInfo = GEMINI_MODELS.find(m => m.id === toModel);
  
  if (!fromModelInfo || !toModelInfo) {
    return `Switched from ${fromModel} to ${toModel}`;
  }
  
  // Determine the reason for switching
  const fromGeneration = fromModel.includes('2.5') ? 2.5 : fromModel.includes('2.0') ? 2.0 : 1.0;
  const toGeneration = toModel.includes('2.5') ? 2.5 : toModel.includes('2.0') ? 2.0 : 1.0;
  
  if (toGeneration > fromGeneration) {
    return `Upgraded from ${fromModelInfo.name} to ${toModelInfo.name} for better performance`;
  } else if (toGeneration < fromGeneration) {
    return `Switched to ${toModelInfo.name} due to quota exhaustion on ${fromModelInfo.name}`;
  } else {
    // Same generation, compare cost tiers
    const costTierOrder = { 'low': 1, 'medium': 2, 'high': 3 };
    const fromCost = costTierOrder[fromModelInfo.costTier || 'medium'];
    const toCost = costTierOrder[toModelInfo.costTier || 'medium'];
    
    if (toCost < fromCost) {
      return `Switched to more cost-effective ${toModelInfo.name} from ${fromModelInfo.name}`;
    } else if (toCost > fromCost) {
      return `Upgraded to higher-tier ${toModelInfo.name} from ${fromModelInfo.name}`;
    } else {
      return `Switched to alternative ${toModelInfo.name} from ${fromModelInfo.name}`;
    }
  }
}

// Get model information by ID
export function getModelInfo(modelId: string) {
  return GEMINI_MODELS.find(m => m.id === modelId);
}

// Check if model supports a specific capability
export function modelSupports(modelId: string, capability: keyof typeof MODEL_CAPABILITIES): boolean {
  return MODEL_CAPABILITIES[capability].includes(modelId);
}

// Get recommended model for specific use case
export function getRecommendedModel(useCase: keyof typeof RECOMMENDED_MODELS): string {
  return RECOMMENDED_MODELS[useCase][0];
}

// Get model capabilities (compatibility function)
export function getModelCapabilities(modelId: string) {
  const model = getModelInfo(modelId);
  if (!model) return null;
  
  return {
    supportsVision: model.supportsVision,
    supportsAudio: model.supportsAudio,
    supportsVideo: model.supportsVideo,
    supportsPdf: model.supportsPdf,
    supportsThinking: model.supportsThinking,
    supportsGrounding: model.supportsGrounding,
    supportsUrlContext: model.supportsUrlContext,
    maxTokens: model.maxTokens,
    costTier: model.costTier
  };
}

// Get optimal thinking configuration for a model
export function getOptimalThinkingConfig(modelId: string) {
  const model = getModelInfo(modelId);
  if (!model || !model.supportsThinking) {
    return { enabled: false };
  }
  
  // Configure thinking based on model characteristics
  if (model.id.includes('pro')) {
    return {
      enabled: true,
      showThinking: true,
      maxThinkingTokens: 65536,
      confidence: 'high'
    };
  } else if (model.id.includes('flash')) {
    return {
      enabled: true,
      showThinking: false,
      maxThinkingTokens: 32768,
      confidence: 'medium'
    };
  } else {
    return {
      enabled: true,
      showThinking: false,
      maxThinkingTokens: 16384,
      confidence: 'low'
    };
  }
}

export default GEMINI_MODELS;