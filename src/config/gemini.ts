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
  supportsImageGeneration?: boolean;
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
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Next-gen features with superior speed, native tool use, and 1M token context window',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsGrounding: true,
    supportsUrlContext: true,
    maxTokens: 1000000,
    costTier: 'medium',
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
  {
    id: 'gemini-2.0-flash-preview-image-generation',
    name: 'Gemini 2.0 Flash (Image Generation)',
    description: 'Image generation and editing capabilities with text-to-image and image-to-image support',
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsImageGeneration: true,
    maxTokens: 1000000,
    costTier: 'medium',
  },
  {
    id: 'imagen-4.0-generate-001',
    name: 'Imagen 4.0 (Standard)',
    description: 'Latest Imagen model for high-quality image generation with advanced controls',
    supportsVision: false,
    supportsAudio: false,
    supportsVideo: false,
    supportsImageGeneration: true,
    maxTokens: 480, // Token limit for prompts
    costTier: 'medium',
  },
  {
    id: 'imagen-4.0-ultra-generate-001',
    name: 'Imagen 4.0 Ultra',
    description: 'Ultra high-quality Imagen model for professional image generation (1 image only)',
    supportsVision: false,
    supportsAudio: false,
    supportsVideo: false,
    supportsImageGeneration: true,
    maxTokens: 480,
    costTier: 'high',
  },
  {
    id: 'imagen-4.0-fast-generate-001',
    name: 'Imagen 4.0 Fast',
    description: 'Fast Imagen model optimized for speed while maintaining quality',
    supportsVision: false,
    supportsAudio: false,
    supportsVideo: false,
    supportsImageGeneration: true,
    maxTokens: 480,
    costTier: 'low',
  },
  {
    id: 'imagen-3.0-generate-002',
    name: 'Imagen 3.0',
    description: 'Previous generation Imagen model for reliable image generation',
    supportsVision: false,
    supportsAudio: false,
    supportsVideo: false,
    supportsImageGeneration: true,
    maxTokens: 480,
    costTier: 'low',
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
    supportsImageGeneration: model.supportsImageGeneration || false,
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

// Image generation model selection helper
export const getOptimalImageModel = (prompt: string, requirements?: {
  quality?: 'fast' | 'standard' | 'ultra';
  artistic?: boolean;
  conversational?: boolean;
  speed?: 'fast' | 'normal';
}) => {
  const reqs = requirements || {};
  
  // Ultra quality for professional use
  if (reqs.quality === 'ultra' || reqs.artistic) {
    return 'imagen-4.0-ultra-generate-001';
  }
  
  // Fast generation for quick iterations
  if (reqs.speed === 'fast' || reqs.quality === 'fast') {
    return 'imagen-4.0-fast-generate-001';
  }
  
  // Conversational image generation with context
  if (reqs.conversational) {
    return 'gemini-2.0-flash-preview-image-generation';
  }
  
  // Default standard quality
  return 'imagen-4.0-generate-001';
};